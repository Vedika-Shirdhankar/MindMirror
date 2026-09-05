// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { videoUploader } = require('../services/storageService');
const {
  uploadVideo,
  getVideos,
  deleteVideo,
  searchVideos,
  retryAnalysis,
  updateTranscript,
} = require('../controllers/videoController');

router.use(requireAuth);

router.get('/search', searchVideos);
router.post('/', videoUploader.single('video'), uploadVideo);
router.get('/', getVideos);
router.delete('/:id', deleteVideo);
router.post('/:id/retry-analysis', retryAnalysis);
router.patch('/:id/transcript', updateTranscript);

module.exports = router;
