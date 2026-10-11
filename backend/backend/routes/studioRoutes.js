// routes/studioRoutes.js — API routes for Journal Studio
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const studioController = require('../controllers/studioController');

// All Journal Studio routes require authentication
router.use(requireAuth);

// Entries
router.get('/entries', studioController.listEntries);
router.get('/entries/:id', studioController.getEntry);
router.post('/entries', studioController.saveEntry);
router.delete('/entries/:id', studioController.deleteEntry);

// Collections
router.get('/collections', studioController.listCollections);
router.put('/collections', studioController.saveCollections);

// Drafts
router.get('/drafts', studioController.listDrafts);
router.post('/drafts', studioController.saveDraft);
router.delete('/drafts/:entryId', studioController.deleteDraft);

// Metadata
router.get('/meta', studioController.getMeta);
router.patch('/meta', studioController.setMeta);

module.exports = router;
