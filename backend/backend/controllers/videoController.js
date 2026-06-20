// controllers/videoController.js
const fs = require('fs');
const path = require('path');
const VideoReflection = require('../models/VideoReflection');
const { generateEmbedding } = require('../utils/embeddings');
const { findSimilarVideos } = require('../utils/vectorSearch');
const { extractAndSaveActions } = require('../utils/actionExtractor');

// POST /api/videos
async function uploadVideo(req, res, next) {
  try {
    const { title, note } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required.' });
    }
    if (!title?.trim()) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to unlink file:', e.message);
      }
      return res.status(400).json({ error: 'Title is required.' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    const reflection = await VideoReflection.create({
      user: req.userId,
      title: title.trim(),
      note: note || '',
      videoUrl,
    });

    // Generate and save embedding automatically
    const searchableText = `${title.trim()}\n${(note || '').trim()}`;
    generateEmbedding(searchableText)
      .then(vec => VideoReflection.updateOne({ _id: reflection._id }, { embedding: vec }))
      .catch(e => console.warn('[embeddings] Failed to generate video embedding:', e.message));

    // Fire-and-forget: extract actions from video title + notes
    if (searchableText.trim()) {
      extractAndSaveActions(searchableText, 'VideoReflection', reflection._id, req.userId);
    }

    res.status(201).json({ reflection });
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to clean up uploaded file:', e.message);
      }
    }
    next(err);
  }
}

// GET /api/videos
async function getVideos(req, res, next) {
  try {
    const videos = await VideoReflection.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ videos });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/videos/:id
async function deleteVideo(req, res, next) {
  try {
    const reflection = await VideoReflection.findOne({ _id: req.params.id, user: req.userId });
    if (!reflection) {
      return res.status(404).json({ error: 'Video reflection not found.' });
    }

    // Delete file from disk
    const filename = reflection.videoUrl.split('/').pop();
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to delete file from disk:', e.message);
      }
    }

    await VideoReflection.deleteOne({ _id: reflection._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/videos/search
async function searchVideos(req, res, next) {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const embedding = await generateEmbedding(query.trim());
    const results = await findSimilarVideos(VideoReflection, {
      embedding,
      userId: req.userId,
      limit: 5,
    });

    const videos = results.map(r => r.video);
    res.json({ videos });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadVideo, getVideos, deleteVideo, searchVideos };
