// models/StudioDraft.js — MongoDB model for Journal Studio unsaved drafts
const mongoose = require('mongoose');

const studioDraftSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entryId: { type: String, required: true },
    entry: { type: mongoose.Schema.Types.Mixed, required: true },
    savedAt: { type: String, required: true },
    isNew: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

studioDraftSchema.index({ userId: 1, entryId: 1 }, { unique: true });

module.exports = mongoose.model('StudioDraft', studioDraftSchema);
