// controllers/videoController.js
const fs = require('fs');
const path = require('path');
const VideoReflection = require('../models/VideoReflection');
const { generateEmbedding } = require('../utils/embeddings');
const { findSimilarVideos } = require('../utils/vectorSearch');
const { extractAndSaveActions } = require('../utils/actionExtractor');
const { analyzeVideoReflection } = require('../utils/videoAnalysis');

async function processVideoBackground(reflectionId, userId, filePath, mimeType, title, note) {
  console.log('[processVideoBackground] Started for reflection:', reflectionId);
  try {
    console.log('[processVideoBackground] Updating status to processing');
    await VideoReflection.updateOne({ _id: reflectionId }, { processingStatus: 'processing' });
    
    // 1. Analyze video
    console.log('[processVideoBackground] Calling analyzeVideoReflection. FilePath:', filePath, 'MimeType:', mimeType);
    const analysis = await analyzeVideoReflection(filePath, mimeType);
    console.log('[processVideoBackground] Analysis successful. Transcript length:', analysis.transcript?.length);
    
    // 2. Update DB with transcript and insights
    console.log('[processVideoBackground] Updating reflection with insights');
    await VideoReflection.updateOne({ _id: reflectionId }, {
      transcript: analysis.transcript,
      summary: analysis.summary,
      themes: analysis.themes,
      triggers: analysis.triggers,
      sentiment: analysis.sentiment,
      mood_score: analysis.mood_score,
      actionsMentioned: analysis.actionsMentioned,
      aiGeneratedInsights: analysis.aiGeneratedInsights,
      processingStatus: 'completed'
    });

    // 3. Generate embeddings including new transcript and summary
    console.log('[processVideoBackground] Generating embeddings');
    const searchableText = `${title}\n${note}\n${analysis.transcript}\n${analysis.summary}`;
    if (searchableText.trim()) {
      const vec = await generateEmbedding(searchableText);
      await VideoReflection.updateOne({ _id: reflectionId }, { embedding: vec });
      extractAndSaveActions(searchableText, 'VideoReflection', reflectionId, userId);
    }
    console.log('[processVideoBackground] Finished successfully');
  } catch (err) {
    console.error('[processVideoBackground] Video processing failed:', err.message, err.stack);
    await VideoReflection.updateOne({ _id: reflectionId }, { processingStatus: 'failed' });
  }
}

// POST /api/videos
async function uploadVideo(req, res, next) {
  console.log('[uploadVideo] Request received. Body:', req.body);
  try {
    const { title, note } = req.body;
    if (!req.file) {
      console.error('[uploadVideo] No req.file found');
      return res.status(400).json({ error: 'Video file is required.' });
    }
    console.log('[uploadVideo] File received:', req.file.path, req.file.mimetype);
    if (!title?.trim()) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('[uploadVideo] Failed to unlink file:', e.message);
      }
      return res.status(400).json({ error: 'Title is required.' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    console.log('[uploadVideo] Creating reflection document');
    const reflection = await VideoReflection.create({
      user: req.userId,
      title: title.trim(),
      note: note || '',
      videoUrl,
      processingStatus: 'pending'
    });
    console.log('[uploadVideo] Reflection created:', reflection._id);

    // Fire-and-forget background processing
    console.log('[uploadVideo] Triggering processVideoBackground');
    processVideoBackground(reflection._id, req.userId, req.file.path, req.file.mimetype, title, note)
      .catch(e => console.error('[uploadVideo] Unhandled rejection in processVideoBackground:', e));

    console.log('[uploadVideo] Sending 201 response');
    res.status(201).json({ reflection });
  } catch (err) {
    console.error('[uploadVideo] 500 Error:', err.message, err.stack);
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

// POST /api/videos/:id/retry-analysis
async function retryAnalysis(req, res, next) {
  try {
    const reflection = await VideoReflection.findOne({ _id: req.params.id, user: req.userId });
    if (!reflection) {
      return res.status(404).json({ error: 'Video reflection not found.' });
    }

    if (reflection.processingStatus === 'processing' || reflection.processingStatus === 'completed') {
      return res.status(400).json({ error: 'Cannot retry a video that is already processed or processing.' });
    }

    const filename = reflection.videoUrl.split('/').pop();
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Source video file not found. Cannot retry analysis.' });
    }

    // Determine mimeType based on extension
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.mp4' ? 'video/mp4' : 'video/webm';

    // Fire-and-forget background processing again
    processVideoBackground(reflection._id, req.userId, filePath, mimeType, reflection.title, reflection.note);

    res.json({ message: 'Retry initiated', processingStatus: 'processing' });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadVideo, getVideos, deleteVideo, searchVideos, retryAnalysis };
