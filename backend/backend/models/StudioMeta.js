// models/StudioMeta.js — MongoDB model for Journal Studio metadata (seed status, preferences)
const mongoose = require('mongoose');

const studioMetaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    demoSeeded: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudioMeta', studioMetaSchema);
