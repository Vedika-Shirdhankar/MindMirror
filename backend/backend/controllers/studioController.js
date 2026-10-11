// controllers/studioController.js — Controller for Journal Studio backend operations
const StudioEntry = require('../models/StudioEntry');
const StudioCollection = require('../models/StudioCollection');
const StudioDraft = require('../models/StudioDraft');
const StudioMeta = require('../models/StudioMeta');
const logger = require('../utils/logger');

// ─── Entries ─────────────────────────────────────────────────────────────────

// GET /api/journal-studio/entries
async function listEntries(req, res, next) {
  try {
    const entries = await StudioEntry.find({ userId: req.userId }).sort({ updatedAt: -1 });
    const formatted = entries.map((doc) => {
      const obj = doc.toJSON();
      delete obj._id;
      delete obj.__v;
      delete obj.userId;
      return obj;
    });
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal-studio/entries/:id
async function getEntry(req, res, next) {
  try {
    const entry = await StudioEntry.findOne({ userId: req.userId, id: req.params.id });
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    const obj = entry.toJSON();
    delete obj._id;
    delete obj.__v;
    delete obj.userId;
    res.json({ success: true, data: obj });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal-studio/entries
async function saveEntry(req, res, next) {
  try {
    const entryData = req.body;
    if (!entryData.id) {
      return res.status(400).json({ success: false, error: 'Entry id is required' });
    }

    const updatePayload = {
      title: entryData.title || '',
      content: entryData.content || '',
      mood: entryData.mood || null,
      prompt: entryData.prompt || null,
      favorite: !!entryData.favorite,
      theme: entryData.theme || 'cream',
      stickers: Array.isArray(entryData.stickers) ? entryData.stickers : [],
      collectionId: entryData.collectionId || null,
      isDemo: !!entryData.isDemo,
      createdAt: entryData.createdAt || new Date().toISOString(),
      updatedAt: entryData.updatedAt || new Date().toISOString(),
    };

    const entry = await StudioEntry.findOneAndUpdate(
      { userId: req.userId, id: entryData.id },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Automatically remove any draft for this committed entry
    await StudioDraft.findOneAndDelete({ userId: req.userId, entryId: entryData.id });

    const obj = entry.toJSON();
    delete obj._id;
    delete obj.__v;
    delete obj.userId;
    res.json({ success: true, data: obj });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/journal-studio/entries/:id
async function deleteEntry(req, res, next) {
  try {
    const { id } = req.params;
    await StudioEntry.findOneAndDelete({ userId: req.userId, id });
    await StudioDraft.findOneAndDelete({ userId: req.userId, entryId: id });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Collections ─────────────────────────────────────────────────────────────

// GET /api/journal-studio/collections
async function listCollections(req, res, next) {
  try {
    const collections = await StudioCollection.find({ userId: req.userId }).sort({ createdAt: 1 });
    const formatted = collections.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

// PUT /api/journal-studio/collections
async function saveCollections(req, res, next) {
  try {
    const nextCollections = Array.isArray(req.body.collections) ? req.body.collections : [];
    
    // Replace user's collection set
    await StudioCollection.deleteMany({ userId: req.userId });
    
    if (nextCollections.length > 0) {
      const docs = nextCollections.map((c) => ({
        userId: req.userId,
        id: c.id,
        name: c.name,
        emoji: c.emoji || '📁',
      }));
      await StudioCollection.insertMany(docs);
    }

    res.json({ success: true, data: nextCollections });
  } catch (err) {
    next(err);
  }
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

// GET /api/journal-studio/drafts
async function listDrafts(req, res, next) {
  try {
    const drafts = await StudioDraft.find({ userId: req.userId }).sort({ updatedAt: -1 });
    const formatted = drafts.map((d) => ({
      entry: d.entry,
      savedAt: d.savedAt,
      isNew: d.isNew,
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal-studio/drafts
async function saveDraft(req, res, next) {
  try {
    const { entry, savedAt, isNew } = req.body;
    if (!entry || !entry.id) {
      return res.status(400).json({ success: false, error: 'Draft entry and id are required' });
    }

    const draft = await StudioDraft.findOneAndUpdate(
      { userId: req.userId, entryId: entry.id },
      {
        $set: {
          entry,
          savedAt: savedAt || new Date().toISOString(),
          isNew: !!isNew,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      data: {
        entry: draft.entry,
        savedAt: draft.savedAt,
        isNew: draft.isNew,
      },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/journal-studio/drafts/:entryId
async function deleteDraft(req, res, next) {
  try {
    const { entryId } = req.params;
    await StudioDraft.findOneAndDelete({ userId: req.userId, entryId });
    res.json({ success: true, message: 'Draft deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

// GET /api/journal-studio/meta
async function getMeta(req, res, next) {
  try {
    let meta = await StudioMeta.findOne({ userId: req.userId });
    if (!meta) {
      meta = await StudioMeta.create({ userId: req.userId, demoSeeded: false });
    }
    res.json({ success: true, data: { demoSeeded: meta.demoSeeded } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/journal-studio/meta
async function setMeta(req, res, next) {
  try {
    const { demoSeeded } = req.body;
    const meta = await StudioMeta.findOneAndUpdate(
      { userId: req.userId },
      { $set: { demoSeeded: !!demoSeeded } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: { demoSeeded: meta.demoSeeded } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEntries,
  getEntry,
  saveEntry,
  deleteEntry,
  listCollections,
  saveCollections,
  listDrafts,
  saveDraft,
  deleteDraft,
  getMeta,
  setMeta,
};
