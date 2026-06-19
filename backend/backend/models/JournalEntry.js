// models/JournalEntry.js
const mongoose = require('mongoose');

// Sub-schema for a related/similar memory reference returned by AI analysis
const relatedMemorySchema = new mongoose.Schema(
  {
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' },
    reason: { type: String }, // why this past entry is similar
  },
  { _id: false }
);

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    text: { type: String, required: true },

    // ── manually logged (still supported, e.g. from the slider UI) ──
    mood: { type: Number, min: 1, max: 10 }, // legacy manual mood; AI mood_score below supersedes when present

    // ── AI-generated structured analysis (matches the spec format) ──
    themes: [{ type: String }],
    triggers: [{ type: String }],
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed', ''], default: '' },
    mood_score: { type: Number, min: 1, max: 10 },
    summary: { type: String, default: '' },
    coping_suggestions: [{ type: String }],
    trend: { type: String, enum: ['improving', 'worsening', 'stable', 'unknown', ''], default: '' },
    related_memories: [relatedMemorySchema],
    risk_level: { type: String, enum: ['none', 'low', 'moderate', 'high', ''], default: 'none' },
    needs_support: { type: Boolean, default: false },

    // ── manually tagged coping strategies actually used (user input, distinct from AI suggestions) ──
    copingUsed: [{ type: String }],

    resolved: { type: Boolean, default: false },
    resolvedNote: { type: String, default: '' },

    // ── Semantic embedding (Gemini text-embedding-004, 768-dim) ──
    // Stored for in-process cosine similarity search.
    // select: false keeps it out of normal queries for performance.
    embedding: { type: [Number], select: false },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

journalEntrySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);