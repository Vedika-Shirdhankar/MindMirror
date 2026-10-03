// controllers/journalController.js
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { analyzeJournalEntry } = require('../utils/aiAnalysis');
const { CRISIS_RESOURCES } = require('../utils/crisisResources');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding, cosineSimilarity } = require('../utils/embeddings');
const { extractAndSaveActions } = require('../utils/actionExtractor');
const { classifyJournal } = require('../services/mlService');

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
// Reliability First: Saves the user's reflection to MongoDB FIRST before executing AI/ML analysis.
// If AI fails, the journal is guaranteed to remain saved and safely returned.
async function createEntry(req, res, next) {
  let entry;
  try {
    const { text, mood, copingUsed } = req.body;
    if (typeof text !== "string") {
      return res.status(400).json({ error: "Text must be a string." });
    }
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Entry text is required.' });
    }

    const trimmedText = text.trim();
    const rawMood = mood ?? 5;
    const safeMood = Math.min(10, Math.max(1, Number.isFinite(+rawMood) ? +rawMood : 5));

    // ── 1. MANDATORY PERSISTENCE: Save journal entry immediately ──
    entry = await JournalEntry.create({
      user: req.userId,
      text: trimmedText,
      mood: safeMood,
      copingUsed: copingUsed || [],
      sentiment: 'neutral',
      risk_level: 'none',
    });

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Pull user configuration & support preferences for personalized grounding
    const user = await User.findById(req.userId).select('language supportPreferences').lean();

    // Pull recent history for trend comparison + similar-memory matching
    const previousEntries = await JournalEntry.find({ user: req.userId, _id: { $ne: entry._id } })
      .sort({ date: -1 })
      .limit(15)
      .lean();

    // ── 2. PARALLEL AI / ML PROCESSING ──
    // 2a. DistilBERT text pattern signal (FastAPI microservice)
    const mlPromise = classifyJournal(trimmedText);

    // 2b. Gemini contextual analysis with user's support preferences
    let analysis = {
      themes: [], triggers: [], sentiment: 'neutral', mood_score: safeMood,
      summary: '', coping_suggestions: [], trend: 'unknown',
      related_memories: [], risk_level: 'none', needs_support: false,
      emotions: [], stress_level: 5, anxiety_level: 5, burnout_signal: false,
      distortions: [], growth_suggestion: '', affirmation: '',
    };

    let aiError = null;
    const geminiPromise = (async () => {
      if (geminiApiKey) {
        try {
          return await analyzeJournalEntry(
            trimmedText,
            previousEntries,
            geminiApiKey,
            user?.language || 'en',
            user?.supportPreferences || {}
          );
        } catch (e) {
          aiError = e.message;
          return null;
        }
      } else {
        aiError = 'No Gemini API key configured on server.';
        return null;
      }
    })();

    const [mlResult, geminiResult] = await Promise.all([mlPromise, geminiPromise]);
    if (geminiResult) {
      analysis = geminiResult;
    }

    const mlAnalysisData = mlResult?.available
      ? {
          label: mlResult.label,
          confidence: mlResult.confidence,
          scores: mlResult.scores || {},
        }
      : null;

    // AI mood_score supersedes when available
    const finalMood = Number.isFinite(+analysis.mood_score)
      ? Math.min(10, Math.max(1, +analysis.mood_score))
      : safeMood;

    // ── 3. UPDATE SAVED JOURNAL WITH AI INSIGHTS ──
    entry.mood_score = finalMood;
    entry.themes = analysis.themes || [];
    entry.triggers = analysis.triggers || [];
    entry.sentiment = analysis.sentiment || 'neutral';
    entry.summary = analysis.summary || '';
    entry.coping_suggestions = analysis.coping_suggestions || [];
    entry.trend = analysis.trend || 'unknown';
    entry.related_memories = analysis.related_memories || [];
    entry.risk_level = analysis.risk_level || 'none';
    entry.needs_support = Boolean(analysis.needs_support);
    entry.emotions = analysis.emotions || [];
    entry.stress_level = analysis.stress_level || 5;
    entry.anxiety_level = analysis.anxiety_level || 5;
    entry.burnout_signal = Boolean(analysis.burnout_signal);
    entry.distortions = analysis.distortions || [];
    entry.growth_suggestion = analysis.growth_suggestion || '';
    entry.affirmation = analysis.affirmation || '';
    entry.ml_analysis = mlAnalysisData;

    await entry.save();

    // ── 4. VECTOR EMBEDDING & PAST-SELF VIDEO RECOMMENDATIONS ──
    let recommendedVideos = [];
    try {
      const vec = await generateEmbedding(trimmedText);
      await JournalEntry.updateOne({ _id: entry._id }, { embedding: vec });

      const VideoReflection = require('../models/VideoReflection');
      const { findSimilarVideos } = require('../utils/vectorSearch');
      const videoResults = await findSimilarVideos(VideoReflection, {
        embedding: vec,
        userId: req.userId,
        limit: 3,
      });
      recommendedVideos = videoResults.map(r => r.video);
    } catch (e) {
      console.warn('[embeddings/recommendations] Failed:', e.message);
    }

    // Fire-and-forget: extract actions from the journal text
    extractAndSaveActions(trimmedText, 'JournalEntry', entry._id, req.userId);

    const responseBody = {
      entry,
      recommendedVideos,
      aiError,
      mlAnalysis: mlAnalysisData,
      mlAvailable: Boolean(mlResult?.available),
    };

    // ── 5. DEDICATED HIGH-RISK SAFETY MODE & GROUNDING RESOURCE ──
    const isCrisisSignal =
      analysis.risk_level === 'moderate' ||
      analysis.risk_level === 'high' ||
      (mlResult?.label === 'suicidal' && (mlResult?.confidence || 0) >= 0.5);

    if (isCrisisSignal) {
      const FutureSelfMessage = require('../models/FutureSelfMessage');
      const futureSelf = await FutureSelfMessage.findOne({ user: req.userId }).lean();

      responseBody.support = {
        ...CRISIS_RESOURCES,
        isSafetyMode: true,
        riskLevel: analysis.risk_level || (mlResult?.label === 'suicidal' ? 'high' : 'moderate'),
        groundingMessage: futureSelf
          ? {
              messageType: futureSelf.messageType,
              text: futureSelf.text,
              mediaUrl: futureSelf.mediaUrl,
              promptUsed: futureSelf.promptUsed,
              createdAt: futureSelf.createdAt,
            }
          : null,
      };
    }

    res.status(201).json(responseBody);
  } catch (err) {
    // If journal entry was created before a downstream error, return the saved entry
    if (entry && entry._id) {
      return res.status(201).json({
        entry,
        aiError: 'AI analysis could not be completed at this moment, but your journal is safely saved.',
        mlAvailable: false,
      });
    }
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

// PATCH /api/journal/:id/pin
async function togglePin(req, res, next) {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    entry.pinned = !entry.pinned;
    await entry.save();
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
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite' });

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

module.exports = { getEntries, createEntry, deleteEntry, markResolved, togglePin, buildThoughtLadder, semanticSearch };