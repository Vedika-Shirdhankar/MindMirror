// routes/letterFromMirrorRoutes.js
const express = require('express');
const router = express.Router();
const { generateLetter } = require('../controllers/letterFromMirrorController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', generateLetter);

module.exports = router;