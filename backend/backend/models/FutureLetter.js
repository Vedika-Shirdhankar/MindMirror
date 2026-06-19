// models/FutureLetter.js
const mongoose = require('mongoose');

const futureLetterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    triggerThemes: [{ type: String }], // themes that should cause this letter to surface
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FutureLetter', futureLetterSchema);