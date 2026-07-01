// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    joinDate: { type: Date, default: Date.now },
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