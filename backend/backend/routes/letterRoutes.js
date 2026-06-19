// routes/letterRoutes.js
const express = require('express');
const router = express.Router();
const { getLetters, createLetter, deleteLetter } = require('../controllers/letterController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getLetters);
router.post('/', createLetter);
router.delete('/:id', deleteLetter);

module.exports = router;