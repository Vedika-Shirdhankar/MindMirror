// models/Chat.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    // memories surfaced alongside this message (for user messages, via findRelevantMemories)
    relatedMemories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);