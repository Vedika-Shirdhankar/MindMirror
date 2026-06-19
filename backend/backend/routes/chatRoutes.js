// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getHistory, sendMessage } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/history', getHistory);
router.post('/message', sendMessage);

module.exports = router;