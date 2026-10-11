// models/StudioCollection.js — MongoDB model for Journal Studio collections
const mongoose = require('mongoose');

const studioCollectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: '📁' },
  },
  {
    timestamps: true,
  }
);

studioCollectionSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model('StudioCollection', studioCollectionSchema);
