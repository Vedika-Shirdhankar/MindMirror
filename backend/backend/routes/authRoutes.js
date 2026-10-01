// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getMe, changePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', requireAuth, getMe);
router.put('/change-password', requireAuth, changePassword);

module.exports = router;