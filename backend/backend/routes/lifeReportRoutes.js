// routes/lifeReportRoutes.js
const express = require('express');
const router = express.Router();
const { getLifeReport } = require('../controllers/lifeReportController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getLifeReport);

module.exports = router;
