// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const { getEntries, createEntry, deleteEntry, markResolved, togglePin, toggleNextStep, buildThoughtLadder, semanticSearch } = require('../controllers/journalController');
const { getCalendarData, generateMonthlyReflection } = require('../controllers/calendarController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); // every journal route requires login

// Calendar & Mood routes (placed before param routes)
router.get('/calendar', getCalendarData);
router.post('/calendar/reflection', generateMonthlyReflection);

router.get('/', getEntries);
router.post('/', createEntry);
router.post('/search', semanticSearch);      // semantic search endpoint
router.delete('/:id', deleteEntry);
router.patch('/:id/resolve', markResolved);
router.patch('/:id/pin', togglePin);
router.patch('/:id/next-step', toggleNextStep);
router.post('/thought-ladder', buildThoughtLadder);

module.exports = router;