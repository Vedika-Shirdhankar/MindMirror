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
// PATCH /api/users/me/preferences
async function updatePreferences(req, res, next) {
  try {
    const preferences = req.body.preferences;
    
    // We only update the preferences field deeply if needed, but Mongoose
    // allows assigning nested objects directly if we use set.
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Merge new preferences into existing
    user.preferences = { ...user.preferences.toObject(), ...preferences };
    await user.save();
    
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, updatePreferences };