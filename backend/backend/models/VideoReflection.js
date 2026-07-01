// models/VideoReflection.js
const mongoose = require('mongoose');

const videoReflectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    note: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    embedding: { type: [Number], select: false },
    transcript: { type: String, default: '' },
    summary: { type: String, default: '' },
    themes: { type: [String], default: [] },
    triggers: { type: [String], default: [] },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed', ''], default: '' },
    mood_score: { type: Number, min: 1, max: 10 },
    actionsMentioned: { type: [String], default: [] },
    aiGeneratedInsights: { type: String, default: '' },
    processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoReflection', videoReflectionSchema);
