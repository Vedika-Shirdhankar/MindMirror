// models/VideoReflection.js
const mongoose = require('mongoose');

const videoReflectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    note: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String },
    embedding: { type: [Number], select: false },

    // — Core analysis (existing) —
    transcript: { type: String, default: '' },
    summary: { type: String, default: '' },
    themes: { type: [String], default: [] },
    triggers: { type: [String], default: [] },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed', ''], default: '' },
    mood_score: { type: Number, min: 1, max: 10 },
    actionsMentioned: { type: [String], default: [] },
    aiGeneratedInsights: { type: String, default: '' },

    // — Enhanced multimodal analysis (new) —
    dominant_emotion: { type: String, default: '' },
    secondary_emotions: { type: [String], default: [] },
    emotional_patterns: { type: [String], default: [] },
    recurring_thoughts: { type: [String], default: [] },
    cognitive_distortions: { type: [String], default: [] },
    gratitude_points: { type: [String], default: [] },
    coping_suggestions: { type: [String], default: [] },
    positive_affirmations: { type: [String], default: [] },
    actionable_next_steps: { type: [String], default: [] },
    stress_level: { type: String, enum: ['low', 'moderate', 'high', 'severe', ''], default: '' },
    anxiety_indicators: { type: [String], default: [] },
    burnout_indicators: { type: [String], default: [] },
    risk_level: { type: String, enum: ['none', 'low', 'moderate', 'high', ''], default: '' },
    needs_support: { type: Boolean, default: false },

    processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
videoReflectionSchema.index({ user: 1, createdAt: -1 });
videoReflectionSchema.index({ user: 1, processingStatus: 1 });
videoReflectionSchema.index({ title: 'text', transcript: 'text', summary: 'text' });

module.exports = mongoose.model('VideoReflection', videoReflectionSchema);
