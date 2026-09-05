// controllers/anchorController.js
// CRUD operations for AnchorSpace items.
// All routes require authentication (req.userId is set by requireAuth middleware).

const AnchorItem = require('../models/AnchorItem');

// ─── GET /api/anchor ──────────────────────────────────────────────────────────
// Returns all anchors for the logged-in user, grouped by category.
async function getAllAnchorItems(req, res, next) {
  try {
    const items = await AnchorItem.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Group by category for easy consumption by the frontend
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/anchor/:category ────────────────────────────────────────────────
// Returns anchors for a specific category (used by "I'm not okay" quick-access modal).
async function getItemsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const VALID = ['anxious', 'sad', 'overthinking', 'tired', 'lost', 'unmotivated'];
    if (!VALID.includes(category)) {
      return res.status(400).json({ success: false, error: `Invalid category. Must be one of: ${VALID.join(', ')}` });
    }

    const items = await AnchorItem.find({ userId: req.userId, category })
      .sort({ usageCount: -1, createdAt: -1 }) // most-used first for quick access
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/anchor ─────────────────────────────────────────────────────────
async function createAnchorItem(req, res, next) {
  try {
    const { category, type, content, tags } = req.body;

    if (!category || !type || !content?.trim()) {
      return res.status(400).json({ success: false, error: 'category, type, and content are required.' });
    }

    const item = await AnchorItem.create({
      userId: req.userId,
      category,
      type,
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/anchor/:id ──────────────────────────────────────────────────────
async function updateAnchorItem(req, res, next) {
  try {
    const item = await AnchorItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Anchor item not found.' });
    }

    const { category, type, content, tags } = req.body;
    if (category) item.category = category;
    if (type) item.type = type;
    if (content) item.content = content.trim();
    if (tags !== undefined) item.tags = Array.isArray(tags) ? tags.filter(Boolean) : [];

    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/anchor/:id ───────────────────────────────────────────────────
async function deleteAnchorItem(req, res, next) {
  try {
    const item = await AnchorItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Anchor item not found.' });
    }
    res.json({ success: true, message: 'Anchor deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/anchor/use/:id ─────────────────────────────────────────────────
// Called when the user clicks an anchor in the "I'm not okay" modal.
async function trackUsage(req, res, next) {
  try {
    const { helped } = req.body; // optional boolean feedback
    const item = await AnchorItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $inc: { usageCount: 1, effectivenessScore: helped ? 1 : 0 } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, error: 'Anchor item not found.' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllAnchorItems,
  getItemsByCategory,
  createAnchorItem,
  updateAnchorItem,
  deleteAnchorItem,
  trackUsage,
};