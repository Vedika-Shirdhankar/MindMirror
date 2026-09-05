// routes/jobRoutes.js
// Endpoints for querying background job status and subscribing to SSE progress.
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getJob, streamJobProgress } = require('../controllers/videoController');

router.use(requireAuth);

// GET /api/jobs/:id — Poll for job status
router.get('/:id', getJob);

// GET /api/jobs/:id/progress — SSE stream for real-time progress
router.get('/:id/progress', streamJobProgress);

module.exports = router;
