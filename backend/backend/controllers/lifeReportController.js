// controllers/lifeReportController.js
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const VideoReflection = require('../models/VideoReflection');
const FutureLetter = require('../models/FutureLetter');
const Chat = require('../models/Chat');
const ActionMemory = require('../models/ActionMemory');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// GET /api/life-report
async function getLifeReport(req, res, next) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const firstName = (user.name || 'there').split(' ')[0];

    // Gather all data sources in parallel
    const [entries, videos, futureLetters, chatObj, actionMemories] = await Promise.all([
      JournalEntry.find({ user: req.userId }).sort({ date: 1 }).lean(),
      VideoReflection.find({ user: req.userId }).sort({ createdAt: 1 }).lean(),
      FutureLetter.find({ user: req.userId }).sort({ date: 1 }).lean(),
      Chat.findOne({ user: req.userId }).lean(),
      ActionMemory.find({ user: req.userId }).sort({ createdAt: 1 }).lean(),
    ]);

    // Check if there is enough data
    if (entries.length < 2) {
      return res.json({
        report: null,
        reason: 'not_enough_data',
        message: 'Write at least two journal entries to unlock your personal Life Report.',
      });
    }

    // ── 1. Calculate Stats ──
    const journalEntriesWritten = entries.length;
    const videosRecorded = videos.length;
    const resolvedCount = entries.filter(e => e.resolved).length;
    
    // Streak Calculation (YYYY-MM-DD standard format en-CA)
    const uniqueDates = [...new Set(entries.map(e => new Date(e.date).toLocaleDateString('en-CA')))].sort((a, b) => new Date(b) - new Date(a));
    let currentStreak = 0;
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      // Streak is valid if user posted today or yesterday
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        currentStreak = 1;
        let current = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          const prev = new Date(uniqueDates[i]);
          const diffTime = Math.abs(current - prev);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
            current = prev;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }

    // Average Mood
    const moodScores = entries.map(e => e.mood_score ?? e.mood).filter(m => m != null);
    const averageMood = moodScores.length ? Math.round((moodScores.reduce((a, b) => a + b, 0) / moodScores.length) * 10) / 10 : null;

    // Theme frequency
    const themeCounts = {};
    entries.forEach(e => (e.themes || []).forEach(t => { themeCounts[t] = (themeCounts[t] || 0) + 1; }));
    const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonTheme = sortedThemes.length ? sortedThemes[0][0] : 'None';

    // Milestones (any resolved issue, any video, future letter, or entries with high mood_score/distress >= 8)
    const milestonesCount = resolvedCount + videosRecorded + futureLetters.length + entries.filter(e => (e.mood_score ?? e.mood) >= 8).length;

    const stats = {
      journalEntriesWritten,
      videosRecorded,
      resolvedIssues: resolvedCount,
      currentStreak,
      averageMood,
      mostCommonTheme,
      growthMilestones: milestonesCount,
    };

    // ── 2. Build Chronological Timeline ──
    const timelineItems = [];

    // Add journal entries
    entries.forEach(e => {
      timelineItems.push({
        id: e._id,
        type: 'journal',
        date: e.date,
        title: e.themes && e.themes.length > 0 ? e.themes.slice(0, 2).join(' & ') : 'Journal Entry',
        detail: e.summary || e.text.slice(0, 150) + (e.text.length > 150 ? '...' : ''),
        mood_score: e.mood_score ?? e.mood,
        resolved: e.resolved,
        triggers: e.triggers,
        themes: e.themes,
      });

      // Also add separate timeline item for when they resolved it
      if (e.resolved && e.resolvedNote) {
        timelineItems.push({
          id: `${e._id}-resolved`,
          type: 'resolved',
          date: e.updatedAt || e.date, // fallback
          title: `Resolved: ${e.themes && e.themes[0] ? e.themes[0] : 'Challenge'}`,
          detail: e.resolvedNote,
          mood_score: e.mood_score ?? e.mood,
          originalJournalId: e._id,
        });
      }
    });

    // Add videos
    videos.forEach(v => {
      timelineItems.push({
        id: v._id,
        type: 'video',
        date: v.createdAt,
        title: v.title,
        detail: v.note || 'Recorded a video reflection.',
        videoUrl: v.videoUrl,
      });
    });

    // Add future letters
    futureLetters.forEach(f => {
      timelineItems.push({
        id: f._id,
        type: 'future_letter',
        date: f.date,
        title: f.title,
        detail: f.body.slice(0, 150) + (f.body.length > 150 ? '...' : ''),
        triggerThemes: f.triggerThemes,
      });
    });

    // Sort timeline chronologically (ascending for sequential growth story)
    timelineItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ── 3. Compile Context Digest for Gemini ──
    const journalSummaries = entries
      .map(e => `[Entry ID: ${e._id}] [Date: ${new Date(e.date).toLocaleDateString('en-IN')}] Mood: ${e.mood_score ?? e.mood}/10. Themes: ${(e.themes || []).join(', ')}. Triggers: ${(e.triggers || []).join(', ')}. Summary: ${e.summary || e.text.slice(0, 150)}. ${e.resolved ? `[RESOLVED NOTE: ${e.resolvedNote}]` : ''}`)
      .join('\n');

    const videoNotes = videos
      .map(v => `[Video ID: ${v._id}] Title: "${v.title}". Note: "${v.note || ''}"`)
      .join('\n');

    const letterNotes = futureLetters
      .map(l => `Title: "${l.title}". Body Snippet: "${l.body.slice(0, 200)}"`)
      .join('\n');

    const chatSnippet = (chatObj?.messages || [])
      .slice(-15)
      .map(m => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`)
      .join('\n');

    const actionSnippet = actionMemories
      .map(a => `- Action: "${a.actionTaken}". Outcome: "${a.outcome || ''}". Helpful: ${a.helpful}`)
      .join('\n');

    // Build the AI Prompt
    const prompt = `You are a wise, warm, and highly observant personal guide writing a "Life Report" on behalf of MindMirror. Your goal is to synthesize the user's data into a deeply personal story of growth.

USER CONTEXT:
Name: ${firstName}
First entry date: ${entries.length ? new Date(entries[0].date).toLocaleDateString('en-IN') : 'N/A'}
Last entry date: ${entries.length ? new Date(entries[entries.length - 1].date).toLocaleDateString('en-IN') : 'N/A'}

STATS:
- Total Journal Entries: ${journalEntriesWritten}
- Videos Recorded: ${videosRecorded}
- Resolved Issues: ${resolvedCount}
- Average Mood (distress score, 1=calm, 10=distress): ${averageMood ?? 'N/A'}
- Most Common Theme: ${mostCommonTheme}

JOURNAL LOGS (Chronological):
${journalSummaries}

VIDEO REFLECTIONS:
${videoNotes || 'No videos recorded.'}

FUTURE LETTERS WRITTEN:
${letterNotes || 'No future letters.'}

COMPANION CHAT HISTORY:
${chatSnippet || 'No chat history.'}

ACTION MEMORIES (Extracted actions & outcomes):
${actionSnippet || 'No action memories.'}

---

TASK:
Generate a structured JSON response reflecting this user's journey. You must output a single, valid JSON object matching the schema below.

JSON SCHEMA:
{
  "letter": "string",
  "aiJourneySummary": "string",
  "whatHelps": [
    { "action": "string", "confidence": "High" | "Medium" | "Low" }
  ],
  "whatDoesntHelp": [
    { "action": "string", "explanation": "string" }
  ],
  "patterns": [
    "string"
  ],
  "videoExplanations": [
    { "videoId": "string", "whyValuable": "string" }
  ],
  "lessonsLearned": [
    { "journalId": "string", "lesson": "string", "strategy": "string" }
  ]
}

---

GUIDELINES & RULES FOR GENERATION:

1. "letter" (The Emotional Centerpiece):
   - Address ${firstName} by name naturally 2-3 times. Do NOT open with "Dear ${firstName}" — find a unique, unhurried opening.
   - Write 5-8 paragraphs in continuous prose. No bullet points, lists, or headers inside the letter.
   - The user should finish reading feeling: understood, proud of their growth, hopeful, encouraged, and motivated to keep moving forward.
   - IMPORTANT: DO NOT use generic inspirational quotes (e.g. "Never give up", "You can do anything", "Believe in yourself", "You are unstoppable"). These feel artificial.
   - INSTEAD: Create motivation using evidence from the user's own journey.
     * Instead of "You are resilient", write: "Even during periods when you felt uncertain, you continued showing up and trying again."
     * Instead of "You are strong", write: "Several situations that once felt overwhelming eventually became chapters you moved beyond."
     * Use details of resolved issues, actual themes, and dates of breakthroughs.
   - The user should think: "Wow, I forgot how far I've actually come" and "I am doing better than I think."
   - ENDING: Must leave them feeling optimistic. Use a style similar to:
     "The future may still contain uncertainty. There will still be difficult days. But your own history tells an important story. Again and again, you found a way to move forward. Not perfectly. Not immediately. But consistently. And if there is one reason to trust yourself going forward, it may be that."
   - Keep the letter between 350-500 words.

2. "aiJourneySummary":
   - Summarize themes, emotional trends, improvements, and growth indicators in a detailed paragraph (3-4 sentences).

3. "whatHelps" (What usually helps):
   - List actions/strategies that helped the user. Rely on ActionMemory with helpful=true, and journal entries with resolved issues/coping.
   - Assign confidence levels (High/Medium/Low) based on frequency and outcomes.

4. "whatDoesntHelp" (What usually doesn't help):
   - Identify unhelpful behaviors or thought patterns supported by user data (e.g. "Overthinking", "Avoidance", "Comparison"). Provide a short explanation of why it increased distress.
   - Do NOT hallucinate; rely on unhelpful actions or high distress logs.

5. "patterns" (Pattern Detection):
   - Generate 3-5 concise, specific bullet point observation statements (e.g., "Your mood often improves after creating a concrete plan", "Uncertainty appears more frequently than actual failure").

6. "videoExplanations":
   - For every video reflection in the list above, output its videoId and a short explanation (1-2 sentences) of why it is valuable to watch. Highlight videos connected to milestones (e.g. "This reflection was recorded during a period of placement anxiety and contains advice about pacing yourself").

7. "lessonsLearned":
   - For every journal entry with resolved=true, map its entryId (as journalId) to the lesson learned and the specific resolution strategy that worked.

Return ONLY the raw JSON block. No markdown wrapper (no \`\`\`json), no text before or after. Ensure all quotes are properly escaped.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.8, 
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      },
    });

    let jsonResponse;
    const responseText = result.response.text().trim();
    try {
      // Clean up potential markdown formatting in case Gemini wraps it in ```json ... ```
      const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response:', responseText, parseErr);
      return res.status(502).json({ error: 'Failed to generate Life Report format from AI. Please try again.' });
    }

    // Merge lessons learned and video value explanations back to timeline/video records
    const resolutionInsights = (entries.filter(e => e.resolved) || []).map(e => {
      const match = (jsonResponse.lessonsLearned || []).find(l => String(l.journalId) === String(e._id));
      return {
        id: e._id,
        title: e.themes && e.themes[0] ? e.themes[0] : 'Challenge',
        dateResolved: e.updatedAt || e.date,
        resolutionNote: e.resolvedNote,
        lessonsLearned: match ? match.lesson : 'Taking proactive steps to address the root concern.',
        resolutionStrategy: match ? match.strategy : 'Focusing on actionable parts of the problem.',
      };
    });

    const videoReflectionsMapped = videos.map(v => {
      const match = (jsonResponse.videoExplanations || []).find(ve => String(ve.videoId) === String(v._id));
      return {
        _id: v._id,
        title: v.title,
        date: v.createdAt,
        videoUrl: v.videoUrl,
        note: v.note,
        whyValuable: match ? match.whyValuable : 'A direct reflection of your feelings and thoughts during this period.',
      };
    });

    res.json({
      stats,
      timeline: timelineItems,
      letter: jsonResponse.letter,
      aiJourneySummary: jsonResponse.aiJourneySummary,
      whatHelps: jsonResponse.whatHelps || [],
      whatDoesntHelp: jsonResponse.whatDoesntHelp || [],
      resolutionInsights,
      adviceFromPastSelf: videoReflectionsMapped,
      patterns: jsonResponse.patterns || [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLifeReport };
