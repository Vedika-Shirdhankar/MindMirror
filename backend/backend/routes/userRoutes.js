// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.put('/me', updateProfile);

module.exports = router;
