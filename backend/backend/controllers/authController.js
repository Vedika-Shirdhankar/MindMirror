// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

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

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
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

module.exports = { signup, login, getMe };