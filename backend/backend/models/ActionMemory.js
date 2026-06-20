// models/ActionMemory.js
const mongoose = require('mongoose');

const actionMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actionTaken: { type: String, required: true },
    outcome: { type: String, default: '' },
    helpful: { type: Boolean, required: true },
    sourceType: {
      type: String,
      enum: ['JournalEntry', 'ResolutionNote', 'VideoReflection', 'CompanionConversation'],
      required: true
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

// Index for fast per-user retrieval
actionMemorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActionMemory', actionMemorySchema);
