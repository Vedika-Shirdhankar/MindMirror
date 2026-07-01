// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile, updatePreferences } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.put('/me', updateProfile);
router.patch('/me/preferences', updatePreferences);

module.exports = router;
