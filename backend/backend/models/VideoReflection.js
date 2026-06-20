// models/VideoReflection.js
const mongoose = require('mongoose');

const videoReflectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    note: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    embedding: { type: [Number], select: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoReflection', videoReflectionSchema);
