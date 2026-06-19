// controllers/letterController.js
const FutureLetter = require('../models/FutureLetter');

// GET /api/letters
async function getLetters(req, res, next) {
  try {
    const letters = await FutureLetter.find({ user: req.userId }).sort({ date: -1 });
    res.json({ letters });
  } catch (err) {
    next(err);
  }
}

// POST /api/letters
async function createLetter(req, res, next) {
  try {
    const { title, body, triggerThemes } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }
    const letter = await FutureLetter.create({
      user: req.userId,
      title: title.trim(),
      body: body.trim(),
      triggerThemes: triggerThemes || [],
    });
    res.status(201).json({ letter });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/letters/:id
async function deleteLetter(req, res, next) {
  try {
    const letter = await FutureLetter.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!letter) return res.status(404).json({ error: 'Letter not found.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLetters, createLetter, deleteLetter };