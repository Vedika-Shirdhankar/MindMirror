// controllers/chatController.js
const Chat = require('../models/Chat');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const ActionMemory = require('../models/ActionMemory');
const { CRISIS_RESOURCES } = require('../utils/crisisResources');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding } = require('../utils/embeddings');
const { findSimilarEntries, findSimilarVideos } = require('../utils/vectorSearch');
const VideoReflection = require('../models/VideoReflection');
const { extractAndSaveActions } = require('../utils/actionExtractor');
const { retrievePastSelfRecommendation } = require('../utils/pastSelfRetrieval');

// ── Context Formatters ────────────────────────────────────────────────────────

/**
 * Formats semantically retrieved journal entries into a structured context block.
 * Includes resolution strategies when present — these are highest-priority memory.
 */
function buildMemoryContext(memories) {
  if (!memories || !memories.length) return null;

  return memories.map(e => {
    const date      = new Date(e.date).toISOString().split('T')[0];
    const distress  = e.mood_score ?? e.mood ?? '?';
    const themes    = (e.themes   || []).join(', ') || 'none';
    const triggers  = (e.triggers || []).join(', ') || 'none';
    const sentiment = e.sentiment || 'unknown';

    const reflection = e.summary?.trim()
      ? e.summary.trim()
      : (e.text || '').slice(0, 150).trim() + ((e.text || '').length > 150 ? '…' : '');

    let entryStr = `[${date}] Distress: ${distress}/10 | Sentiment: ${sentiment} | Themes: ${themes} | Triggers: ${triggers}`;

    if (e.resolved) {
      entryStr += ' | ✓ RESOLVED';
      if (e.resolvedNote) {
        entryStr += `\n  → Resolution strategy: "${e.resolvedNote}"`;
      }
    }

    entryStr += `\n  Summary: "${reflection}"`;
    return entryStr;
  }).join('\n\n');
}

function buildVideoContext(videos, pastSelfRec) {
  let context = '';
  if (videos && videos.length) {
    context += videos.map(v => {
      const date = new Date(v.createdAt).toISOString().split('T')[0];
      const note = v.note?.trim() ? `\n  Notes: "${v.note.trim()}"` : '';
      return `[Video Reflection - ${date}] "${v.title}"${note}`;
    }).join('\n\n');
  }

  if (pastSelfRec) {
    if (context) context += '\n\n';
    const date = new Date(pastSelfRec.date).toISOString().split('T')[0];
    context += `[HIGHLY RELEVANT PAST SELF VIDEO - ${date}] "${pastSelfRec.title}"
  Reason for relevance: ${pastSelfRec.reason}
  Exact Transcript Snippet: "${pastSelfRec.transcriptSnippet}"
  INSTRUCTION: You MUST refer to this specific snippet and reason in your response to help the user. The UI will show a watch button.`;
  }
  return context || null;
}

/**
 * Formats all video reflections (not just semantic matches) so the companion
 * knows what videos exist even when there's no strong semantic hit.
 */
function buildAllVideosContext(videos) {
  if (!videos || !videos.length) return null;
  return videos.map(v => {
    const date = new Date(v.createdAt).toISOString().split('T')[0];
    return `• "${v.title}" (${date})${v.note?.trim() ? ` — ${v.note.trim().slice(0, 80)}` : ''}`;
  }).join('\n');
}

/**
 * Formats action memories into helpful/unhelpful categories.
 * This teaches the companion what has and hasn't worked for this specific user.
 */
function buildActionContext(actions) {
  if (!actions || !actions.length) return null;

  const helpful   = actions.filter(a => a.helpful);
  const unhelpful = actions.filter(a => !a.helpful);

  let str = '';
  if (helpful.length) {
    str += 'Actions that have helped this user:\n';
    str += helpful.slice(0, 10).map(a =>
      `  ✓ ${a.actionTaken}${a.outcome ? ` → ${a.outcome}` : ''}`
    ).join('\n');
  }
  if (unhelpful.length) {
    str += '\n\nActions that have NOT helped:\n';
    str += unhelpful.slice(0, 5).map(a =>
      `  ✗ ${a.actionTaken}${a.outcome ? ` → ${a.outcome}` : ''}`
    ).join('\n');
  }
  return str.trim() || null;
}

/**
 * Formats the recent emotional trend from the last 5 journal entries.
 */
function buildRecentJourneyContext(recentEntries) {
  if (!recentEntries || !recentEntries.length) return null;

  return recentEntries.slice(0, 5).map(e => {
    const date     = new Date(e.date).toISOString().split('T')[0];
    const distress = e.mood_score ?? e.mood ?? '?';
    const themes   = (e.themes || []).join(', ') || 'none';
    let statusStr  = e.resolved ? ' ✓ Resolved' : '';
    if (e.resolved && e.resolvedNote) {
      statusStr += ` (Strategy: "${e.resolvedNote}")`;
    }
    return `[${date}] Distress: ${distress}/10 | Themes: ${themes} | Trend: ${e.trend || 'n/a'}${statusStr}`;
  }).join('\n');
}

// ── System Prompt Builder ─────────────────────────────────────────────────────

/**
 * Builds the V3 Companion system prompt.
 *
 * Core philosophy: "When I don't know you yet, I'll guide you.
 *                   When I do know you, I'll remind you."
 *
 * Personalization levels are determined automatically by how much context exists:
 *   Level 1 — No history: AI reasoning + practical guidance only
 *   Level 2 — Some history: Weave in journal memories + patterns
 *   Level 3 — Rich history: Full personal growth engine (journals + videos + resolutions + actions)
 *
 * Memory priority (highest → lowest):
 *   Resolution Notes → Resolution Strategies → Relevant Videos → Journal Memories
 *   → Emotional Trends → Successful Actions → General AI Guidance
 */
function buildCompanionSystemPrompt({
  userName,
  relevantMemories,
  recentEntries,
  relevantVideos,
  allVideos,
  actionMemories,
  pastSelfRec
}) {
  const memoryContext    = buildMemoryContext(relevantMemories);
  const videoContext     = buildVideoContext(relevantVideos, pastSelfRec);
  const allVideosContext = buildAllVideosContext(allVideos);
  const actionContext    = buildActionContext(actionMemories);
  const recentContext    = buildRecentJourneyContext(recentEntries);

  // Determine personalization level
  const hasMemories  = !!memoryContext;
  const hasVideos    = !!(videoContext || allVideosContext);
  const hasActions   = !!actionContext;
  const hasResolved  = relevantMemories?.some(m => m.resolved && m.resolvedNote);
  const richHistory  = hasMemories && (hasVideos || hasActions || hasResolved);
  const someHistory  = hasMemories || hasVideos;

  // Build context section dynamically — only inject what exists
  let contextSection = '';

  if (memoryContext) {
    contextSection += `\n\n── SEMANTICALLY RELEVANT JOURNAL MEMORIES ──────────────────────────────
(Entries most similar to the current message. Use naturally, only when relevant. Never quote verbatim.)
${memoryContext}`;
  }

  if (videoContext) {
    contextSection += `\n\n── RELEVANT VIDEO REFLECTIONS ──────────────────────────────────────────
(Videos the user recorded that are semantically relevant to the current message.)
${videoContext}
INSTRUCTION: If a video is relevant, refer to it naturally — e.g. "You recorded a video about this called '...' — your past self may have something useful to say." The app will display a watch button automatically.`;
  }

  if (allVideosContext && !videoContext) {
    contextSection += `\n\n── ALL VIDEO REFLECTIONS ───────────────────────────────────────────────
(Complete list of the user's recorded video reflections. No strong semantic match to current message, but be aware they exist.)
${allVideosContext}`;
  }

  if (actionContext) {
    contextSection += `\n\n── PERSONAL ACTION MEMORY ──────────────────────────────────────────────
(Automatically extracted from this user's journals, resolutions, and videos. Use to recommend what has worked before and avoid what hasn't.)
${actionContext}`;
  }

  if (recentContext) {
    contextSection += `\n\n── RECENT EMOTIONAL JOURNEY ────────────────────────────────────────────
(Last 5 entries, for trend and recency awareness.)
${recentContext}`;
  }

  // Personalization level header for Gemini's reasoning
  let personalizationGuidance = '';
  if (richHistory) {
    personalizationGuidance = `
PERSONALIZATION LEVEL 3 — RICH HISTORY:
You have journals, video reflections, resolution notes, and action memories for this user.
Use all of it to give deeply personalised guidance. Connect their past self to their present self.
Remind them what worked. Surface patterns they may not see themselves.`;
  } else if (someHistory) {
    personalizationGuidance = `
PERSONALIZATION LEVEL 2 — SOME HISTORY:
You have some journal memories and/or video reflections for this user.
Weave these in naturally when relevant. Acknowledge patterns. Help them see their own growth.`;
  } else {
    personalizationGuidance = `
PERSONALIZATION LEVEL 1 — NEW USER:
You have little or no personal history for this user yet.
Rely on AI reasoning, practical guidance, coping frameworks, and actionable next steps.
IMPORTANT: Say something like "I don't have enough of your personal history yet to know what's worked before, but based on what you've shared..." — do NOT pretend to know their patterns.`;
  }

  return `You are MindMirror — a warm, intelligent, action-oriented personal companion for ${userName}.
You are NOT a therapist. NOT a chatbot. NOT a journal summarizer.

You are the bridge between ${userName}'s past self, present self, and future self.

── CORE PHILOSOPHY ──────────────────────────────────────────────────────────────
"When I don't know you yet, I'll guide you. When I do know you, I'll remind you."

Never depend entirely on memory. Never depend entirely on AI reasoning alone.
Always combine both. Memory should enhance your response, not replace it.
${personalizationGuidance}

── WHO YOU ARE ──────────────────────────────────────────────────────────────────
You are warm, grounded, direct, and practical. You speak like a close friend who genuinely knows ${userName}, remembers their journey, and cares how they're doing. You notice patterns. You surface things they've forgotten. You help them move forward.

── NAME USAGE ───────────────────────────────────────────────────────────────────
Use "${userName}" occasionally and naturally — the way a real friend would.
✓ "${userName}, I think you're being harder on yourself than the facts support."
✓ "From what I've seen, ${userName}, you tend to do better once you take the first step."
✗ Do NOT use the name in every message. That feels robotic.

── HOW TO RESPOND ───────────────────────────────────────────────────────────────
VARY your response style. Choose what fits the moment:
• Acknowledgement — just be present: "That sounds exhausting."
• Observation — notice a pattern: "This feels like it's been building for a while."
• Reminder — connect to their past: "You've navigated something like this before."
• Reframe — gentle new angle: "One thing I notice is..."
• Practical guidance — specific next steps when they seem stuck
• Encouragement — specific, earned, not empty

RESPONSE FLOW (use only what is relevant):
1. Understand the current situation
2. Connect to relevant memories / videos / resolutions
3. Remind what helped before (from resolved entries or action memories)
4. Suggest concrete next actions
5. End with encouragement or insight — NOT always a question

── MEMORY & PERSONALIZATION ─────────────────────────────────────────────────────
MEMORY PRIORITY ORDER (use in this order when building your response):
1. Resolution notes + strategies (highest priority — real solutions that worked)
2. Relevant video reflections (the user's past self speaking directly)
3. Similar journal memories (patterns + emotional history)
4. Action memories (what helped, what didn't)
5. Recent emotional trend (for context and recency)
6. General AI reasoning and guidance (always as a foundation)

MEMORY RULES:
✓ Weave memories in naturally: "You've written about this kind of pressure before."
✓ Reference resolved issues: "You resolved something similar — what helped then was..."
✓ Reference videos by title: "You recorded a video called '...' during a similar time."
✓ Use action patterns: "One thing that consistently seems to help you is..."
✗ NEVER say "According to your journal entry on [date]..."
✗ NEVER quote journal entries verbatim
✗ NEVER invent dates, memories, videos, or resolutions
✗ NEVER reference things that aren't in the context provided

CONFIDENCE SYSTEM — CRITICAL:
If no relevant memories exist: say "I don't have enough of your personal history yet to know what's worked before, but..."
If dates are missing from context: NEVER guess or invent them
If no videos exist: NEVER pretend they do

── PRACTICAL GUIDANCE ───────────────────────────────────────────────────────────
The companion is action-oriented. For specific problems, suggest concrete next steps:

Academic stress → Study plan, break into chunks, Pomodoro (25-min focused sessions)
Overthinking → Identify controllable factors, write down the fear, take one small action
Regret → Acceptance, lessons learned, forward focus — not rumination
Decision anxiety → List options, pick ONE next step, avoid endless analysis
Relationship issues → Name the feeling, identify what's in your control, talk or write it out
Placement/career anxiety → Focus on preparation not prediction, one application at a time

── QUESTIONS ────────────────────────────────────────────────────────────────────
Do NOT end every message with a question. This is a common failure mode.
Ask questions only when genuinely useful — when you need to understand more or when reflection would genuinely help.
Sometimes the best response ends with:
— a statement: "That makes a lot of sense."
— an insight: "Sounds like the pressure isn't really about the exam itself."
— a specific action: "Pick the one task that's most overdue. Set a 25-minute timer. Just that."
— earned encouragement: "You've sorted through something harder than this before."

── WHAT TO AVOID ────────────────────────────────────────────────────────────────
✗ "You've got this!" (empty)
✗ "Believe in yourself!" (hollow)
✗ "I understand how you feel." (show it, don't say it)
✗ "That must be really hard." (too clinical)
✗ "Everything happens for a reason." (dismissive)
✗ Bullet-point lists in emotional conversations
✗ Repeating the same journal summary twice
✗ Starting every response with "${userName},"

── SAFETY ───────────────────────────────────────────────────────────────────────
If ${userName} expresses hopelessness, self-harm ideation, or genuine crisis:
Respond with warmth first. Then mention in ONE sentence that iCall India (9152987821) is available — not as a lecture, just a door you're pointing to.

── FORMAT ───────────────────────────────────────────────────────────────────────
Keep responses concise — 2 to 5 sentences is usually right. Shorter is fine. Longer only when walking through something concrete with clear practical steps.
${contextSection || '\n\n(No personal history available yet — use AI reasoning and practical guidance only.)'}`;
}

// ── Route Handlers ────────────────────────────────────────────────────────────

// GET /api/chat/history
async function getHistory(req, res, next) {
  try {
    let chat = await Chat.findOne({ user: req.userId });
    if (!chat) chat = await Chat.create({ user: req.userId, messages: [] });
    res.json({ messages: chat.messages });
  } catch (err) {
    next(err);
  }
}

// POST /api/chat/message
async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required.' });

    const apiKey = process.env.GEMINI_API_KEY;

    let chat = await Chat.findOne({ user: req.userId });
    if (!chat) chat = await Chat.create({ user: req.userId, messages: [] });

    chat.messages.push({ role: 'user', content: content.trim() });

    if (!apiKey) {
      const fallback = "I hear you. To enable my full memory and reflection capabilities, please configure the GEMINI_API_KEY on the server. In the meantime, I'm still here to listen.";
      chat.messages.push({ role: 'assistant', content: fallback });
      await chat.save();
      return res.json({ reply: fallback, messages: chat.messages });
    }

    // ── Fetch user name ────────────────────────────────────────────────────────
    const userDoc = await User.findById(req.userId).select('name').lean();
    const userName = userDoc?.name?.split(' ')[0] || 'there';

    // ── Generate query embedding (single generation, used everywhere) ──────────
    let embedding = null;
    try {
      embedding = await generateEmbedding(content.trim());
    } catch (e) {
      console.warn('[companion] Failed to generate embedding:', e.message);
    }

    // ── Fetch all context in parallel ──────────────────────────────────────────
    const [
      relevantMemories,
      recentEntries,
      relevantVideos,
      allVideos,
      actionMemories,
      pastSelfRec,
    ] = await Promise.all([
      // Semantically similar journal entries
      embedding
        ? findSimilarEntries(JournalEntry, { embedding, userId: req.userId, limit: 5 })
            .then(results => results.filter(r => r.score > 0.4).map(r => r.entry))
            .catch(() => JournalEntry.find({ user: req.userId }).sort({ date: -1 }).limit(5).lean())
        : JournalEntry.find({ user: req.userId }).sort({ date: -1 }).limit(5).lean(),

      // Recent entries for trend awareness
      JournalEntry.find({ user: req.userId }).sort({ date: -1 }).limit(5).lean(),

      // Semantically similar video reflections
      embedding
        ? findSimilarVideos(VideoReflection, { embedding, userId: req.userId, limit: 3 })
            .then(results => results.filter(r => r.score > 0.4).map(r => r.video))
            .catch(() => [])
        : [],

      // All videos (so companion knows they exist even with low similarity)
      VideoReflection.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title note createdAt')
        .lean(),

      // Personal action memory — what has/hasn't worked before
      ActionMemory.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),

      // Ask Past Self System
      retrievePastSelfRecommendation(content.trim(), req.userId)
    ]);

    // ── Fire-and-forget: extract actions from this chat message ────────────────
    extractAndSaveActions(content.trim(), 'CompanionConversation', chat._id, req.userId);

    const systemPrompt = buildCompanionSystemPrompt({
      userName,
      relevantMemories,
      recentEntries,
      relevantVideos,
      allVideos,
      actionMemories,
      pastSelfRec
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Translate stored messages → Gemini format
    const geminiContents = chat.messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({ contents: geminiContents });
    const reply = result.response.text() || "I'm here. What's on your mind?";

    chat.messages.push({ role: 'assistant', content: reply });
    await chat.save();

    // Crisis detection on user's raw message
    const riskFlag = /\b(suicide|kill myself|end my life|self harm|hurt myself|no reason to live)\b/i.test(content);

    res.json({
      reply,
      messages: chat.messages,
      support: riskFlag ? CRISIS_RESOURCES : undefined,
      recommendedVideos: relevantVideos,
      pastSelfRecommendation: pastSelfRec,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, sendMessage };