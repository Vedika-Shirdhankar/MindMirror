// controllers/userController.js
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const VideoReflection = require('../models/VideoReflection');
const Chat = require('../models/Chat');
const FutureLetter = require('../models/FutureLetter');
const ActionMemory = require('../models/ActionMemory');
const AnchorItem = require('../models/AnchorItem');
const { logSecurityEvent, SecurityEvent } = require('../utils/auditLogger');

// PUT /api/users/me
async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name: name?.trim() }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/preferences
async function updatePreferences(req, res, next) {
  try {
    const preferences = req.body.preferences;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.preferences = { ...user.preferences?.toObject?.() || {}, ...preferences };
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/language
async function updateLanguage(req, res, next) {
  try {
    const { language } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.language = language;
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/export  (GDPR Data Portability / Export)
async function exportUserData(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [journals, videos, chats, letters, actions, anchors] = await Promise.all([
      JournalEntry.find({ user: req.userId }).lean(),
      VideoReflection.find({ user: req.userId }).lean(),
      Chat.find({ user: req.userId }).lean(),
      FutureLetter.find({ user: req.userId }).lean(),
      ActionMemory.find({ user: req.userId }).lean(),
      AnchorItem.find({ user: req.userId }).lean(),
    ]);

    const exportPayload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      journals,
      videos,
      chats,
      letters,
      actions,
      anchors,
      exportedAt: new Date().toISOString(),
    };

    logSecurityEvent({
      event: SecurityEvent.DATA_EXPORT,
      userId: req.userId,
      status: 'SUCCESS',
      req,
      metadata: {
        journalCount: journals.length,
        videoCount: videos.length,
      },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mindmirror-data-${req.userId}.json`);
    res.json(exportPayload);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/me  (GDPR Right to Erasure / Cascade Account Deletion)
async function deleteAccount(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Cascade delete all associated user data
    const FutureSelfMessage = require('../models/FutureSelfMessage');
    await Promise.all([
      JournalEntry.deleteMany({ user: req.userId }),
      VideoReflection.deleteMany({ user: req.userId }),
      Chat.deleteMany({ user: req.userId }),
      FutureLetter.deleteMany({ user: req.userId }),
      ActionMemory.deleteMany({ user: req.userId }),
      AnchorItem.deleteMany({ user: req.userId }),
      FutureSelfMessage.deleteMany({ user: req.userId }),
      User.findByIdAndDelete(req.userId),
    ]);

    logSecurityEvent({
      event: SecurityEvent.ACCOUNT_DELETION,
      userId: req.userId,
      status: 'SUCCESS',
      req,
      metadata: { email: user.email },
    });

    res.json({ success: true, message: 'Account and all associated personal data permanently deleted.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/support-preferences
async function getSupportPreferences(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('supportPreferences');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ supportPreferences: user.supportPreferences || {} });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me/support-preferences
async function updateSupportPreferences(req, res, next) {
  try {
    const {
      spiritualPreference,
      spiritualitySupport,
      spiritualContentInclusion,
      sourcesOfHope,
      customSourcesOfHope,
      copingPreferences,
      customCopingPreferences,
      personalValues,
      futureSelfMessageStatus,
      onboardingCompleted,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.supportPreferences = {
      ...user.supportPreferences?.toObject?.() || {},
      ...(spiritualPreference !== undefined && { spiritualPreference }),
      ...(spiritualitySupport !== undefined && { spiritualitySupport }),
      ...(spiritualContentInclusion !== undefined && { spiritualContentInclusion }),
      ...(sourcesOfHope !== undefined && { sourcesOfHope }),
      ...(customSourcesOfHope !== undefined && { customSourcesOfHope }),
      ...(copingPreferences !== undefined && { copingPreferences }),
      ...(customCopingPreferences !== undefined && { customCopingPreferences }),
      ...(personalValues !== undefined && { personalValues }),
      ...(futureSelfMessageStatus !== undefined && { futureSelfMessageStatus }),
      ...(onboardingCompleted !== undefined && {
        onboardingCompleted,
        ...(onboardingCompleted && { onboardingCompletedAt: new Date() }),
      }),
    };

    await user.save();

    logSecurityEvent({
      event: SecurityEvent.SUPPORT_PREFERENCES_UPDATED,
      userId: req.userId,
      status: 'SUCCESS',
      req,
    });

    res.json({ success: true, supportPreferences: user.supportPreferences });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateProfile,
  updatePreferences,
  updateLanguage,
  exportUserData,
  deleteAccount,
  getSupportPreferences,
  updateSupportPreferences,
};