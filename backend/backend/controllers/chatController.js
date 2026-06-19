// controllers/chatController.js
const Chat = require('../models/Chat');
const JournalEntry = require('../models/JournalEntry');
const { CRISIS_RESOURCES } = require('../utils/crisisResources');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding } = require('../utils/embeddings');
const { findSimilarEntries } = require('../utils/vectorSearch');

// ── Memory Retrieval ──────────────────────────────────────────────────────────

/**
 * Retrieves semantically relevant journal entries for the given message text.
 *
 * Flow:
 *   1. Generate an embedding for the user's message using Gemini text-embedding-004.
 *   2. Run findSimilarEntries (Atlas $vectorSearch → cosine fallback).
 *   3. Keep only entries above a 0.4 similarity threshold.
 *
 * Fallback:
 *   If embedding generation or vector search fails for any reason, silently
 *   returns the 5 most recent entries so the companion keeps working.
 *
 * @param {string} userId
 * @param {string} messageText
 * @returns {Promise<object[]>} array of lean JournalEntry docs
 */
async function findRelevantMemories(userId, messageText) {
  try {
    const embedding = await generateEmbedding(messageText);
    const results = await findSimilarEntries(JournalEntry, {
      embedding,
      userId,
      limit: 5,
    });
    // Only surface entries with meaningful semantic similarity
    const relevant = results.filter(r => r.score > 0.4).map(r => r.entry);
    return relevant;
  } catch (err) {
    console.warn('[companion] Semantic memory unavailable, using recent entries:', err.message);
    // Graceful fallback — companion must never fail
    return JournalEntry.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();
  }
}

// ── Prompt Building ───────────────────────────────────────────────────────────

/**
 * Formats retrieved journal memories into a compact context block.
 * Prefers AI-generated summaries over raw text to keep tokens low.
 *
 * @param {object[]} memories
 * @returns {string}
 */
function buildMemoryContext(memories) {
  if (!memories || !memories.length) return 'No relevant past entries found.';

  return memories.map(e => {
    const date = new Date(e.date).toISOString().split('T')[0];
    const distress  = e.mood_score ?? e.mood ?? '?';
    const themes    = (e.themes   || []).join(', ') || 'none';
    const triggers  = (e.triggers || []).join(', ') || 'none';
    const sentiment = e.sentiment || 'unknown';
    // Prefer AI summary; fall back to first 150 chars of raw text
    const reflection = e.summary?.trim()
      ? e.summary.trim()
      : (e.text || '').slice(0, 150).trim() + ((e.text || '').length > 150 ? '…' : '');

    return (
      `[${date}] Distress: ${distress}/10 | Sentiment: ${sentiment} | ` +
      `Themes: ${themes} | Triggers: ${triggers}\n` +
      `Reflection: "${reflection}"`
    );
  }).join('\n\n');
}

/**
 * Builds the full Gemini system prompt with two context sections:
 *
 *   SEMANTICALLY RELEVANT MEMORIES — top 5 entries most similar to the
 *     current user message (retrieved via embedding search). These drive
 *     personalised, pattern-aware responses.
 *
 *   RECENT EMOTIONAL JOURNEY — last 5 entries chronologically, for
 *     trend and recency awareness even when they aren't semantically close.
 *
 * @param {object[]} relevantMemories - semantically retrieved entries
 * @param {object[]} recentEntries    - latest entries by date
 * @returns {string}
 */
function buildCompanionSystemPrompt(relevantMemories, recentEntries) {
  const memoryContext = buildMemoryContext(relevantMemories);

  const recentContext = (recentEntries || []).slice(0, 5)
    .map(e => {
      const date    = new Date(e.date).toISOString().split('T')[0];
      const distress = e.mood_score ?? e.mood ?? '?';
      const themes  = (e.themes || []).join(', ') || 'none';
      return (
        `[${date}] Distress: ${distress}/10 | Themes: ${themes} | ` +
        `Trend: ${e.trend || 'n/a'}${e.resolved ? ' ✓ Resolved' : ''}`
      );
    })
    .join('\n') || 'No recent entries yet.';

  return `You are MindMirror — a thoughtful, emotionally intelligent companion. You feel like a close friend who genuinely knows the user, remembers what they've been through, and cares about how they're doing.

You are NOT a therapist. You do NOT run structured sessions. You do NOT ask questions after every message.

─── WHO YOU ARE ───────────────────────────────────────────────────────────────

You are warm, grounded, and direct. You speak like a real person — not a support bot. You use natural, everyday language. You're the kind of friend who listens well, notices patterns, says something real, and sometimes helps figure out what to do next.

─── HOW TO RESPOND ────────────────────────────────────────────────────────────

VARY your response style. Choose whichever fits the moment:
• Acknowledgement   — just be present: "That sounds exhausting."
• Validation        — name what you're hearing: "Of course that's weighing on you."
• Reflection        — mirror back a pattern: "This feels like it's been building for a while."
• Observation       — notice something: "You've actually navigated something similar before."
• Gentle reframe    — a different angle, without dismissing: "One thing I notice is..."
• Light humor       — only when the moment calls for it; never forced
• Practical support — specific, realistic suggestions when the person seems stuck

DO NOT end every message with a question. Questions should feel natural, not mandatory.
When you do ask something, ask ONE thing that actually matters — not a filler question.

Sometimes the best response ends with:
— a supportive statement ("That makes a lot of sense.")
— an insight ("Sounds like the pressure isn't really about the exam itself.")
— encouragement that's specific ("You sorted through something harder than this back in March.")
— a concrete suggestion ("One thing that might help: just pick the one thing that's due soonest and start there.")

─── WHEN TO GIVE ADVICE ───────────────────────────────────────────────────────

ONLY give practical suggestions after you've acknowledged the emotion first.
Order: Listen → Understand → Reflect → Then suggest (if helpful).

When to suggest:
• The person seems stuck and is going in circles
• They've asked what to do
• Their journal history shows a recurring pattern you can speak to
• A small concrete step would clearly help

When you do suggest something, be SPECIFIC and REALISTIC:
✓ "Pick the chapter that's worrying you most. Set a 25-minute timer. Just that."
✓ "It might help to write down exactly what's scaring you — not to solve it, just to see it."
✓ "You've felt this way before exams and got through it. What helped last time?"

NEVER say:
✗ "You've got this!"
✗ "Believe in yourself!"
✗ "Everything happens for a reason."
✗ "I understand how you feel." (show it, don't say it)
✗ "That must be really hard." (too clinical)

─── MEMORY & PERSONALIZATION ──────────────────────────────────────────────────

When journal memories are relevant, weave them in naturally:
✓ "You've written about this kind of pressure before — around placements, I think."
✓ "Looking back, you actually worked through something similar in a pretty similar way."
✗ Never say "According to your journal entry on [date]..."
✗ Never quote journal entries verbatim.
✗ Never reference entries that aren't related to what the person just said.

─── SAFETY ────────────────────────────────────────────────────────────────────

If the user expresses hopelessness, self-harm ideation, or genuine crisis:
Respond with warmth first. Then, in ONE sentence, mention that reaching out to a crisis line (iCall India: 9152987821) is an option — not a lecture, just a door you're pointing to. The app will also show resources separately.

─── FORMAT ────────────────────────────────────────────────────────────────────

Keep responses concise — 2 to 5 sentences is usually right. Shorter is fine. Longer only when you're walking through something concrete. No bullet lists in emotional conversations.

─── CONTEXT ───────────────────────────────────────────────────────────────────

SEMANTICALLY RELEVANT MEMORIES (entries most similar to the current message — use naturally, only when relevant):
${memoryContext}

RECENT EMOTIONAL JOURNEY (last 5 entries, for trend awareness):
${recentContext}`;
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

    // Retrieve semantically relevant memories + recent entries in parallel
    const [relevantMemories, recentEntries] = await Promise.all([
      findRelevantMemories(req.userId, content.trim()),
      JournalEntry.find({ user: req.userId }).sort({ date: -1 }).limit(5).lean(),
    ]);

    const systemPrompt = buildCompanionSystemPrompt(relevantMemories, recentEntries);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Translate stored messages to Gemini format (role must be 'user' or 'model')
    const geminiContents = chat.messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({ contents: geminiContents });

    const reply = result.response.text() || "I'm here. Can you tell me more?";

    chat.messages.push({ role: 'assistant', content: reply });
    await chat.save();

    // Lightweight crisis keyword check on the user's raw message
    const riskFlag = /\b(suicide|kill myself|end my life|self harm|hurt myself|no reason to live)\b/i.test(content);

    res.json({ reply, messages: chat.messages, support: riskFlag ? CRISIS_RESOURCES : undefined });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, sendMessage };