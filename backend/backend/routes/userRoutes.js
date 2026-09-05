// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile, updatePreferences, updateLanguage } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.put('/me', updateProfile);
router.patch('/me/preferences', updatePreferences);
router.patch('/me/language', updateLanguage);

module.exports = router;
