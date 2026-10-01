// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, sparse: true, index: true, default: null },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatarUrl: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    language: { type: String, default: 'en' },
    preferences: {
      theme: { type: String, default: 'midnight' },
      customTheme: {
        primary: { type: String, default: '#7F77DD' },
        accent: { type: String, default: '#5DCAA5' },
        background: { type: String, default: '#0f0f13' },
        surface: { type: String, default: 'rgba(255, 255, 255, 0.04)' },
        text: { type: String, default: '#e8e6f0' },
      },
      colorMode: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
      typography: {
        fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
        fontFamily: { type: String, default: 'Inter' }
      },
      layout: {
        density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
        cardStyle: { type: String, enum: ['glass', 'elevated', 'flat', 'minimal'], default: 'glass' },
        borderRadius: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
      },
      animations: { type: String, enum: ['full', 'reduced', 'disabled'], default: 'full' },
      ambientBackground: { type: String, default: 'none' },
      accessibility: {
        highContrast: { type: Boolean, default: false },
        dyslexiaFont: { type: Boolean, default: false }
      }
    },
    // ── Personalized Support & Grounding Preferences ──
    supportPreferences: {
      spiritualPreference: {
        type: String,
        enum: ['yes', 'no', 'not_sure', 'prefer_not_to_say', ''],
        default: ''
      },
      spiritualitySupport: {
        type: String,
        enum: ['yes', 'sometimes', 'no', 'prefer_not_to_say', ''],
        default: ''
      },
      spiritualContentInclusion: {
        type: String,
        enum: ['yes', 'no', 'only_when_asked', ''],
        default: 'no'
      },
      sourcesOfHope: [{ type: String }],
      customSourcesOfHope: { type: String, default: '', trim: true },
      copingPreferences: [{ type: String }],
      customCopingPreferences: { type: String, default: '', trim: true },
      personalValues: { type: String, default: '', trim: true },
      futureSelfMessageStatus: {
        type: String,
        enum: ['not_created', 'recorded', 'written', 'dismissed', 'remind_later'],
        default: 'not_created'
      },
      onboardingCompleted: { type: Boolean, default: false },
      onboardingCompletedAt: { type: Date }
    }
  },
  { timestamps: true }
);

// Instance method: compare plaintext password against stored hash
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never leak passwordHash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);