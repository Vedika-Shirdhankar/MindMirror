const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { transcribeAudio } = require('../controllers/voiceController');

router.post('/transcribe', requireAuth, transcribeAudio);

module.exports = router;