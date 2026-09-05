// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getHistory, sendMessage, streamMessage } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/history', getHistory);
router.post('/message', sendMessage);
router.post('/message/stream', streamMessage);

module.exports = router;