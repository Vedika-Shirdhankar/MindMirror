// models/MonthlyReflection.js
const mongoose = require('mongoose');

const monthlyReflectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    summary: {
      type: String,
      default: '',
    },
    emotionalThemes: [{
      type: String,
    }],
    notableChanges: [{
      type: String,
    }],
    recurringTopics: [{
      type: String,
    }],
    positiveMoments: [{
      type: String,
    }],
    reflectionQuestions: [{
      type: String,
    }],
    entryCount: {
      type: Number,
      default: 0,
    },
    uncertaintyNotes: {
      type: String,
      default: '',
    },
    disclaimer: {
      type: String,
      default: 'These reflections are generated to support mindful self-exploration. They are not psychological assessments or medical diagnoses.',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Each user can have only one saved reflection per year/month
monthlyReflectionSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyReflection', monthlyReflectionSchema);
