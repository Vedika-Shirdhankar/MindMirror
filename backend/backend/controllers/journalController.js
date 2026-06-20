// controllers/journalController.js
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { analyzeJournalEntry } = require('../utils/aiAnalysis');
const { CRISIS_RESOURCES } = require('../utils/crisisResources');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding, cosineSimilarity } = require('../utils/embeddings');
const { extractAndSaveActions } = require('../utils/actionExtractor');

// GET /api/journal
async function getEntries(req, res, next) {
  try {
    const entries = await JournalEntry.find({ user: req.userId })
      .sort({ date: -1 })
      .populate('related_memories.entryId', 'text date themes mood_score');
    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal
// Creates an entry AND runs full AI analysis (enhancements 1,2,3,4,5,6,10) in one step.
async function createEntry(req, res, next) {
  try {
    const { text, mood, copingUsed } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Entry text is required.' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Pull recent history for trend comparison + similar-memory matching
    const previousEntries = await JournalEntry.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(15)
      .lean();

    let analysis = {
      themes: [], triggers: [], sentiment: 'neutral', mood_score: mood ?? 5,
      summary: '', coping_suggestions: [], trend: 'unknown',
      related_memories: [], risk_level: 'none', needs_support: false,
    };

    let aiError = null;
    if (geminiApiKey) {
      try {
        analysis = await analyzeJournalEntry(text.trim(), previousEntries, geminiApiKey);
      } catch (e) {
        aiError = e.message;
        // Entry is still saved even if AI analysis fails — never block journaling on AI availability.
      }
    } else {
      aiError = 'No Gemini API key configured on the server. Configure GEMINI_API_KEY in backend .env to enable AI analysis.';
    }

    // `mood` from req.body is optional; fall back to AI-derived mood_score.
    // Clamp to [1,10] as a last-resort safeguard — Mongoose schema min is 1,
    // and Gemini can occasionally return 0 for very calm entries.
    const rawMood = mood ?? analysis.mood_score ?? 5;
    const safeMood = Math.min(10, Math.max(1, Number.isFinite(+rawMood) ? +rawMood : 5));

    const entry = await JournalEntry.create({
      user: req.userId,
      text: text.trim(),
      mood: safeMood,
      copingUsed: copingUsed || [],
      ...analysis,
    });

    let recommendedVideos = [];
    try {
      const vec = await generateEmbedding(text.trim());
      await JournalEntry.updateOne({ _id: entry._id }, { embedding: vec });

      const VideoReflection = require('../models/VideoReflection');
      const { findSimilarVideos } = require('../utils/vectorSearch');
      const videoResults = await findSimilarVideos(VideoReflection, {
        embedding: vec,
        userId: req.userId,
        limit: 3
      });
      recommendedVideos = videoResults.map(r => r.video);
    } catch (e) {
      console.warn('[embeddings/recommendations] Failed:', e.message);
    }

    // Fire-and-forget: extract actions from the journal text
    extractAndSaveActions(text.trim(), 'JournalEntry', entry._id, req.userId);

    const responseBody = { entry, recommendedVideos, aiError };

    // Safety net: always attach crisis resources at the API layer when risk is flagged,
    // regardless of what the model included in its own summary text.
    if (analysis.risk_level === 'moderate' || analysis.risk_level === 'high') {
      responseBody.support = CRISIS_RESOURCES;
    }

    res.status(201).json(responseBody);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/journal/:id
async function deleteEntry(req, res, next) {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/journal/:id/resolve
async function markResolved(req, res, next) {
  try {
    const { resolvedNote } = req.body;
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { resolved: true, resolvedNote: resolvedNote || '' },
      { new: true }
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });

    // Fire-and-forget: extract resolution strategies as action memories
    if (resolvedNote?.trim()) {
      extractAndSaveActions(resolvedNote.trim(), 'ResolutionNote', entry._id, req.userId);
    }

    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

async function buildThoughtLadder(req, res, next) {
  try {
    const { situation } = req.body;
    if (!situation?.trim()) return res.status(400).json({ error: 'A situation description is required.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You help people challenge cognitive distortions by breaking down catastrophic thinking into a "Thought Ladder."

Given this situation: "${situation.trim()}"

Return ONLY a JSON object (no markdown code blocks, no preamble, no commentary) with this structure:
{
  "fact": "the objective observable fact (1 sentence)",
  "predictions": [
    {"text": "first prediction/assumption", "type": "assumption"},
    {"text": "second prediction", "type": "prediction"},
    {"text": "third prediction", "type": "prediction"}
  ],
  "catastrophe": "the worst-case conclusion the person jumped to",
  "reframe": "a gentle, realistic alternative perspective (1-2 sentences)",
  "question": "one reflective question to help them examine the ladder"
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = result.response.text();
    let ladder;
    try {
      ladder = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      console.error('Failed to parse thought ladder output:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    res.json({ ladder });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal/search
// Semantic search: embed the query, cosine-rank all user entries with embeddings.
async function semanticSearch(req, res, next) {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Search query is required.' });

    // Get query embedding
    let queryVec;
    try {
      queryVec = await generateEmbedding(query.trim());
    } catch (e) {
      return res.status(503).json({ error: 'Embedding service unavailable. Check GEMINI_API_KEY.' });
    }

    // Fetch all entries that already have embeddings (select: false field needs explicit +embedding)
    const entries = await JournalEntry.find({ user: req.userId })
      .select('+embedding text date themes mood_score mood summary sentiment resolved resolvedNote')
      .lean();

    const scored = entries
      .filter(e => e.embedding?.length)
      .map(e => ({
        _id: e._id,
        text: e.text,
        date: e.date,
        themes: e.themes,
        mood_score: e.mood_score ?? e.mood,
        summary: e.summary,
        sentiment: e.sentiment,
        resolved: e.resolved,
        resolvedNote: e.resolvedNote,
        score: cosineSimilarity(queryVec, e.embedding),
      }))
      .filter(e => e.score > 0.5) // Only surface meaningfully similar results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(e => { delete e.embedding; return e; }); // never send vectors to client

    res.json({ results: scored, total: scored.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEntries, createEntry, deleteEntry, markResolved, buildThoughtLadder, semanticSearch };