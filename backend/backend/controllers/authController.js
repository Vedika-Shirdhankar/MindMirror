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

module.exports = { signup, login, getMe, changePassword };