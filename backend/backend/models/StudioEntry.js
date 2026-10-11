// models/StudioEntry.js — MongoDB model for Journal Studio entries
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const placedStickerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    z: { type: Number, default: 1 },
    layer: { type: String, enum: ['front', 'back'], default: 'front' },
  },
  { _id: false }
);

const studioEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    // Sensitive rich text HTML content is encrypted at rest
    content: {
      type: String,
      default: '',
      set: encrypt,
      get: decrypt,
    },
    mood: {
      type: String,
      enum: ['happy', 'peaceful', 'grateful', 'excited', 'sad', 'anxious', 'overwhelmed', 'angry', 'hopeful', 'numb', null],
      default: null,
    },
    prompt: { type: String, default: null },
    favorite: { type: Boolean, default: false },
    theme: {
      type: String,
      enum: ['cream', 'lined', 'dotted', 'grid', 'blush', 'lavender', 'sage'],
      default: 'cream',
    },
    stickers: [placedStickerSchema],
    collectionId: { type: String, default: null },
    isDemo: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Compound indexes
studioEntrySchema.index({ userId: 1, id: 1 }, { unique: true });
studioEntrySchema.index({ userId: 1, updatedAt: -1 });
studioEntrySchema.index({ userId: 1, favorite: 1 });
studioEntrySchema.index({ userId: 1, mood: 1 });
studioEntrySchema.index({ userId: 1, collectionId: 1 });

module.exports = mongoose.model('StudioEntry', studioEntrySchema);
