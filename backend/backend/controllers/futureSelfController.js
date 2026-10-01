// controllers/futureSelfController.js
// Handles personal Future-Self Grounding Messages (Video, Audio, Written Text)
// Strict authorization: all operations are strictly scoped to authenticated req.userId.

const FutureSelfMessage = require('../models/FutureSelfMessage');
const User = require('../models/User');
const { deleteFile, uploadToCloudinary } = require('../services/storageService');
const { logSecurityEvent, SecurityEvent } = require('../utils/auditLogger');
const logger = require('../utils/logger');
const config = require('../config');

// GET /api/future-self/message
async function getMessage(req, res, next) {
  try {
    const message = await FutureSelfMessage.findOne({ user: req.userId }).lean();
    res.json({ message: message || null });
  } catch (err) {
    next(err);
  }
}

// POST /api/future-self/text
async function saveTextMessage(req, res, next) {
  try {
    const { text, promptUsed } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const trimmedText = text.trim();

    // Check if user previously had a media file attached and clean it up
    const existing = await FutureSelfMessage.findOne({ user: req.userId });
    if (existing && existing.mediaUrl) {
      deleteFile(existing.mediaUrl);
    }

    const message = await FutureSelfMessage.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        messageType: 'text',
        text: trimmedText,
        mediaUrl: '',
        cloudinaryPublicId: '',
        promptUsed: promptUsed || '',
        createdAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user preferences status
    await User.findByIdAndUpdate(req.userId, {
      'supportPreferences.futureSelfMessageStatus': 'written',
    });

    logSecurityEvent({
      event: SecurityEvent.FUTURE_SELF_MESSAGE_CREATED,
      userId: req.userId,
      status: 'SUCCESS',
      req,
      metadata: { messageType: 'text' },
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
}

// POST /api/future-self/upload (multipart video or audio)
async function uploadMediaMessage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided.' });
    }

    const { promptUsed, durationSeconds, messageType = 'video' } = req.body;
    const isAudio = req.file.mimetype?.startsWith('audio/') || messageType === 'audio';
    const chosenType = isAudio ? 'audio' : 'video';

    let mediaUrl = `/uploads/${req.file.filename}`;
    let cloudinaryPublicId = '';

    // Upload to Cloudinary if configured
    if (config.cloudinaryUrl) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path);
        mediaUrl = uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId;
        deleteFile(req.file.path); // Remove local temp copy after cloud upload
      } catch (cloudErr) {
        logger.warn({ message: 'Cloudinary upload failed for future self, falling back to local storage', error: cloudErr.message });
      }
    }

    // Clean up previous media file if user is replacing their message
    const existing = await FutureSelfMessage.findOne({ user: req.userId });
    if (existing && existing.mediaUrl) {
      deleteFile(existing.mediaUrl);
    }

    const message = await FutureSelfMessage.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        messageType: chosenType,
        mediaUrl,
        cloudinaryPublicId,
        promptUsed: promptUsed || '',
        durationSeconds: Number(durationSeconds) || 0,
        text: '', // clear text when media is uploaded
        createdAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user preferences status
    await User.findByIdAndUpdate(req.userId, {
      'supportPreferences.futureSelfMessageStatus': 'recorded',
    });

    logSecurityEvent({
      event: SecurityEvent.FUTURE_SELF_MESSAGE_CREATED,
      userId: req.userId,
      status: 'SUCCESS',
      req,
      metadata: { messageType: chosenType },
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    // If an error happens after file was written to disk, clean it up
    if (req.file?.path) {
      deleteFile(req.file.path);
    }
    next(err);
  }
}

// DELETE /api/future-self/message
async function deleteMessage(req, res, next) {
  try {
    const existing = await FutureSelfMessage.findOne({ user: req.userId });
    if (!existing) {
      return res.status(404).json({ error: 'No message found to delete.' });
    }

    if (existing.mediaUrl) {
      deleteFile(existing.mediaUrl);
    }

    await FutureSelfMessage.deleteOne({ _id: existing._id, user: req.userId });

    // Reset status in user preferences
    await User.findByIdAndUpdate(req.userId, {
      'supportPreferences.futureSelfMessageStatus': 'not_created',
    });

    logSecurityEvent({
      event: SecurityEvent.FUTURE_SELF_MESSAGE_DELETED,
      userId: req.userId,
      status: 'SUCCESS',
      req,
    });

    res.json({ success: true, message: 'Future-self message successfully deleted.' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/future-self/status (e.g. remind_later or dismissed)
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['not_created', 'recorded', 'written', 'dismissed', 'remind_later'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 'supportPreferences.futureSelfMessageStatus': status },
      { new: true }
    );

    res.json({ success: true, futureSelfMessageStatus: user.supportPreferences?.futureSelfMessageStatus });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMessage,
  saveTextMessage,
  uploadMediaMessage,
  deleteMessage,
  updateStatus,
};
