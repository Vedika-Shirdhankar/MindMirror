// models/FutureSelfMessage.js
// Dedicated storage for the user's personal Future-Self Grounding Message
// (Video, Audio, or Written text created when feeling okay, to be revisited during distress)

const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const futureSelfMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active grounding message per user (allows seamless replacement)
      index: true,
    },
    messageType: {
      type: String,
      enum: ['video', 'audio', 'text'],
      required: true,
      default: 'video',
    },
    // Sensitive personal message text (encrypted at rest using AES-256-GCM)
    text: {
      type: String,
      default: '',
      set: encrypt,
      get: decrypt,
    },
    // Media URL for video or audio file (local path or Cloudinary URL)
    mediaUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    promptUsed: {
      type: String,
      default: '',
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model('FutureSelfMessage', futureSelfMessageSchema);
