// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', getDashboard);

module.exports = router;