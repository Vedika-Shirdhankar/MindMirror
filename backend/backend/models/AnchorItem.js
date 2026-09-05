// models/AnchorItem.js
const mongoose = require('mongoose');

const anchorItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['anxious', 'sad', 'overthinking', 'tired', 'lost', 'unmotivated'],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['quote', 'video', 'note', 'image'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    usageCount: { type: Number, default: 0 },
    effectivenessScore: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Compound index for optimized querying by user and category
anchorItemSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('AnchorItem', anchorItemSchema);