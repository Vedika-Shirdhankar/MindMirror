// controllers/letterFromMirrorController.js
// Generates the "Letter From MindMirror" — a deeply personal reflective letter
// synthesizing all of a user's journaling history, resolutions, and emotional arc.

const JournalEntry = require('../models/JournalEntry');
const FutureLetter = require('../models/FutureLetter');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// GET /api/letter-from-mirror
async function generateLetter(req, res, next) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const user = await User.findById(req.userId).lean();
    const firstName = (user?.name || 'there').split(' ')[0];

    // Gather all data sources
    const entries = await JournalEntry.find({ user: req.userId }).sort({ date: 1 }).lean();

    if (entries.length < 2) {
      return res.json({
        letter: null,
        reason: 'not_enough_data',
        message: 'Write at least a few journal entries before your letter can be generated.',
      });
    }

    const futureLetters = await FutureLetter.find({ user: req.userId }).sort({ date: 1 }).lean();
    const chat = await Chat.findOne({ user: req.userId }).lean();

    // Build context digest
    const resolvedEntries = entries.filter(e => e.resolved);
    const totalEntries = entries.length;
    const dateRange = {
      first: entries[0].date,
      last: entries[entries.length - 1].date,
    };

    // Theme frequency
    const themeCounts = {};
    entries.forEach(e => (e.themes || []).forEach(t => { themeCounts[t] = (themeCounts[t] || 0) + 1; }));
    const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);

    // Mood arc
    const moodScores = entries.map(e => e.mood_score ?? e.mood ?? null).filter(Boolean);
    const earlyMoodAvg = average(moodScores.slice(0, Math.ceil(moodScores.length / 3)));
    const recentMoodAvg = average(moodScores.slice(-Math.ceil(moodScores.length / 3)));
    const moodDirection = recentMoodAvg < earlyMoodAvg ? 'improving' : recentMoodAvg > earlyMoodAvg ? 'worsening' : 'stable';

    // Key moments (entries with highest mood scores, resolutions, or distinctive summaries)
    const keyMoments = entries
      .filter(e => e.resolved || e.risk_level === 'high' || (e.mood_score ?? e.mood ?? 0) >= 8)
      .slice(0, 6)
      .map(e => ({
        date: e.date,
        text: e.text.slice(0, 200),
        summary: e.summary,
        resolved: e.resolved,
        resolvedNote: e.resolvedNote,
        mood_score: e.mood_score ?? e.mood,
      }));

    // All summaries for narrative
    const allSummaries = entries
      .filter(e => e.summary)
      .map(e => `[${new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}] ${e.summary}`)
      .join('\n');

    // Coping strategies that helped
    const copingCounts = {};
    entries.forEach(e => (e.copingUsed || []).forEach(c => { copingCounts[c] = (copingCounts[c] || 0) + 1; }));
    const topCoping = Object.entries(copingCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

    // Future letters they wrote to themselves
    const futureLetterSnippets = futureLetters
      .slice(0, 3)
      .map(l => `Title: "${l.title}" — "${l.body.slice(0, 150)}"`)
      .join('\n');

    // Sample of companion conversations
    const chatSample = (chat?.messages || [])
      .filter(m => m.role === 'user')
      .slice(-8)
      .map(m => m.content.slice(0, 120))
      .join('\n');

    // Build prompt
    const prompt = `You are writing a deeply personal, reflective letter on behalf of MindMirror — a journaling app that has been quietly witnessing this person's inner life.

This is NOT an analytics report. This is a heartfelt letter from the app to the user — warm, emotionally intelligent, specific to their actual journey.

USER CONTEXT:
Name: ${firstName}
Journaling period: ${new Date(dateRange.first).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} → ${new Date(dateRange.last).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
Total entries: ${totalEntries}
Issues they resolved: ${resolvedEntries.length}
Dominant themes in their writing: ${topThemes.join(', ')}
Mood arc: ${moodDirection} (early avg distress: ${earlyMoodAvg.toFixed(1)}/10 → recent: ${recentMoodAvg.toFixed(1)}/10; 0=calm, 10=acute distress)
Coping strategies they used most: ${topCoping.join(', ') || 'not recorded'}

AI REFLECTIONS ON THEIR ENTRIES (chronological):
${allSummaries.slice(0, 3000)}

KEY MOMENTS (high distress, resolutions, breakthroughs):
${keyMoments.map(m => `• ${new Date(m.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}: ${m.summary || m.text.slice(0, 100)}${m.resolved ? ` [RESOLVED — ${m.resolvedNote || 'marked as resolved'}]` : ''}`).join('\n') || 'None recorded'}

LETTERS THEY WROTE TO THEIR FUTURE SELF:
${futureLetterSnippets || 'None written'}

THINGS THEY SHARED WITH THE AI COMPANION:
${chatSample || 'No conversations recorded'}

---

Now write the letter. Rules:

1. Address ${firstName} by name occasionally (not every paragraph — maybe 2-3 times). Don't start with "Dear ${firstName}" — find a more original opening.

2. Write 5-8 paragraphs. Each should do one emotional job: naming a struggle, reflecting a pattern, recognizing a strength, marking growth, or looking forward.

3. Be SPECIFIC. Reference actual themes, actual mood patterns, actual coping strategies, actual resolutions from the data above. Never say generic things like "you've been through a lot." Show that you actually saw what they went through.

4. Tone: warm, present, unhurried. Like a wise friend who has been paying attention. Not a therapist. Not a motivational speaker. Not a robot.

5. Do NOT use bullet points, headers, or lists. This is prose.

6. The ending should land emotionally. Something the user will remember. Don't summarize — close with something true and specific about who they are.

7. Never invent events. Everything comes from the data above.

8. Keep it between 350-500 words.

Return ONLY the letter text. No title. No "Letter from MindMirror" header. No preamble.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1024 },
    });

    const letterText = result.response.text().trim();

    // Build metadata to pass to frontend for display context
    const meta = {
      firstName,
      totalEntries,
      resolvedCount: resolvedEntries.length,
      topThemes,
      moodDirection,
      dateRange,
      generatedAt: new Date(),
    };

    res.json({ letter: letterText, meta });
  } catch (err) {
    next(err);
  }
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = { generateLetter };