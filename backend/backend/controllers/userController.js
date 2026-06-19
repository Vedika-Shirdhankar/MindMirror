// controllers/userController.js
const User = require('../models/User');

// PUT /api/users/me
async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name: name?.trim() }, { new: true });
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile };