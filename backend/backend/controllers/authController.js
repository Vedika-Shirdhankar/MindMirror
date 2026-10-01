// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { logSecurityEvent, SecurityEvent } = require('../utils/auditLogger');

const SALT_ROUNDS = 12;

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are all required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      logSecurityEvent({
        event: SecurityEvent.SIGNUP_SUCCESS,
        status: 'FAILURE',
        req,
        metadata: { reason: 'Duplicate email registration attempt', email: normalizedEmail },
      });
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    logSecurityEvent({
      event: SecurityEvent.SIGNUP_SUCCESS,
      userId: user._id,
      status: 'SUCCESS',
      req,
      metadata: { email: normalizedEmail },
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      logSecurityEvent({
        event: SecurityEvent.LOGIN_FAILURE,
        status: 'FAILURE',
        req,
        metadata: { reason: 'User not found', email: normalizedEmail },
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'This account was registered with Google Sign-In. Please click "Continue with Google".' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      logSecurityEvent({
        event: SecurityEvent.LOGIN_FAILURE,
        userId: user._id,
        status: 'FAILURE',
        req,
        metadata: { reason: 'Invalid password', email: normalizedEmail },
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    logSecurityEvent({
      event: SecurityEvent.LOGIN_SUCCESS,
      userId: user._id,
      status: 'SUCCESS',
      req,
      metadata: { email: normalizedEmail },
    });

    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/google
async function googleAuth(req, res, next) {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    let payload = null;

    if (credential) {
      try {
        const { OAuth2Client } = require('google-auth-library');
        const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID ? [process.env.GOOGLE_CLIENT_ID] : undefined,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        // Fallback: verify via Google tokeninfo endpoint
        const fetch = globalThis.fetch || require('node-fetch');
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!response.ok) {
          return res.status(401).json({ error: 'Invalid Google credential token.' });
        }
        payload = await response.json();
      }
    } else if (accessToken) {
      const fetch = globalThis.fetch || require('node-fetch');
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        return res.status(401).json({ error: 'Invalid Google access token.' });
      }
      payload = await response.json();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Unable to extract email from Google profile.' });
    }

    const { email, name, sub: googleId, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        avatarUrl: picture || '',
        supportPreferences: {
          onboardingCompleted: false,
        },
      });
      isNewUser = true;

      logSecurityEvent({
        event: SecurityEvent.SIGNUP_SUCCESS,
        userId: user._id,
        status: 'SUCCESS',
        req,
        metadata: { provider: 'google', email: normalizedEmail },
      });
    } else {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        needsSave = true;
      }
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }

      logSecurityEvent({
        event: SecurityEvent.LOGIN_SUCCESS,
        userId: user._id,
        status: 'SUCCESS',
        req,
        metadata: { provider: 'google', email: normalizedEmail },
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toJSON(),
      isNewUser,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password  (requires auth)
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      logSecurityEvent({
        event: SecurityEvent.PASSWORD_CHANGE_FAILURE,
        userId: req.userId,
        status: 'FAILURE',
        req,
        metadata: { reason: 'Incorrect current password provided' },
      });
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    logSecurityEvent({
      event: SecurityEvent.PASSWORD_CHANGE_SUCCESS,
      userId: req.userId,
      status: 'SUCCESS',
      req,
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (requires auth)
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, googleAuth, getMe, changePassword };