// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const { getEntries, createEntry, deleteEntry, markResolved, togglePin, buildThoughtLadder, semanticSearch } = require('../controllers/journalController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); // every journal route requires login

router.get('/', getEntries);
router.post('/', createEntry);
router.post('/search', semanticSearch);      // semantic search endpoint
router.delete('/:id', deleteEntry);
router.patch('/:id/resolve', markResolved);
router.patch('/:id/pin', togglePin);
router.post('/thought-ladder', buildThoughtLadder);

module.exports = router;
