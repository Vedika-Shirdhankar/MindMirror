// routes/futureSelfRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { videoUploader } = require('../services/storageService');
const {
  getMessage,
  saveTextMessage,
  uploadMediaMessage,
  deleteMessage,
  updateStatus,
} = require('../controllers/futureSelfController');

// All future-self message routes require authenticated JWT
router.use(requireAuth);

router.get('/message', getMessage);
router.post('/text', saveTextMessage);
router.post('/upload', videoUploader.single('media'), uploadMediaMessage);
router.delete('/message', deleteMessage);
router.patch('/status', updateStatus);

module.exports = router;
