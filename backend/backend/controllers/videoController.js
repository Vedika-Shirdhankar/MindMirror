// controllers/videoController.js
// Thin controller — delegates to services.
// No business logic here; all heavy lifting is in videoWorker + storageService.

const VideoReflection = require('../models/VideoReflection');
const { generateEmbedding } = require('../utils/embeddings');
const { findSimilarVideos } = require('../utils/vectorSearch');
const { deleteFile, resolveUploadPath, uploadToCloudinary, deleteFromCloudinary, downloadFromCloudinary } = require('../services/storageService');
const { enqueueVideoAnalysis, getJobStatus } = require('../services/jobQueue');
const { processVideoJob } = require('../services/videoWorker');
const { addClient } = require('../services/sseService');
const logger = require('../utils/logger');
const fs = require('fs');

// POST /api/videos
async function uploadVideo(req, res, next) {
  try {
    const { title, note } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Video file is required.' });
    }
    if (!title?.trim()) {
      deleteFile(req.file.path);
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    let videoUrl = `/uploads/${req.file.filename}`;
    let cloudinaryPublicId = undefined;

    const config = require('../config');
    logger.info({ message: 'Cloudinary configuration check', configured: !!config.cloudinaryUrl });

    if (config.cloudinaryUrl) {
      try {
        const cloudResult = await uploadToCloudinary(req.file.path);
        if (cloudResult && cloudResult.url) {
          videoUrl = cloudResult.url;
          cloudinaryPublicId = cloudResult.publicId;
        }
        logger.info({ 
          message: 'Cloudinary upload result', 
          publicId: cloudResult?.publicId, 
          storedUrl: videoUrl 
        });
      } catch (uploadErr) {
        logger.error({ message: 'Cloudinary upload failed, falling back to local storage', error: uploadErr.message });
      }
    }

    const reflection = await VideoReflection.create({
      user: req.userId,
      title: title.trim(),
      note: note || '',
      videoUrl,
      cloudinaryPublicId,
      processingStatus: 'pending',
    });

    const User = require('../models/User');
    const user = await User.findById(req.userId).select('language').lean();
    
    // Enqueue the AI job (returns immediately)
    const { jobId, queued } = await enqueueVideoAnalysis(
      {
        reflectionId: reflection._id.toString(),
        userId: req.userId,
        userLanguage: user?.language || 'en',
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        title,
        note,
        isCloudinary: !!cloudinaryPublicId
      },
      processVideoJob
    );

    logger.info({ message: 'Video uploaded and job enqueued', reflectionId: reflection._id, jobId, queued, requestId: req.requestId });

    res.status(202).json({
      success: true,
      data: {
        reflection,
        jobId,
        queued,
        statusUrl: jobId ? `/api/jobs/${jobId}` : null,
        progressUrl: jobId ? `/api/jobs/${jobId}/progress` : null,
      },
    });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    next(err);
  }
}

// GET /api/videos
async function getVideos(req, res, next) {
  try {
    const videos = await VideoReflection.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { videos } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/videos/:id
async function deleteVideo(req, res, next) {
  try {
    const reflection = await VideoReflection.findOne({ _id: req.params.id, user: req.userId });
    if (!reflection) {
      return res.status(404).json({ success: false, error: 'Video reflection not found.' });
    }
    
    if (reflection.cloudinaryPublicId) {
      await deleteFromCloudinary(reflection.cloudinaryPublicId);
    } else if (reflection.videoUrl.startsWith('/uploads/')) {
      deleteFile(reflection.videoUrl);
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
    if (!query?.trim()) {
      return res.status(400).json({ success: false, error: 'Search query is required.' });
    }
    const embedding = await generateEmbedding(query.trim());
    const results = await findSimilarVideos(VideoReflection, { embedding, userId: req.userId, limit: 5 });
    res.json({ success: true, data: { videos: results.map((r) => r.video) } });
  } catch (err) {
    next(err);
  }
}

// POST /api/videos/:id/retry-analysis
async function retryAnalysis(req, res, next) {
  try {
    const reflection = await VideoReflection.findOne({ _id: req.params.id, user: req.userId });
    if (!reflection) {
      return res.status(404).json({ success: false, error: 'Video reflection not found.' });
    }
    if (['processing', 'completed'].includes(reflection.processingStatus)) {
      return res.status(400).json({ success: false, error: 'Cannot retry a video already processed or processing.' });
    }

    let filePath;
    let mimeType;

    if (reflection.cloudinaryPublicId) {
      // Cloudinary video: download temporarily to local disk for Gemini
      const localFileName = `retry-${Date.now()}-${reflection.cloudinaryPublicId.replace(/[^a-zA-Z0-9]/g, '')}.webm`;
      try {
        filePath = await downloadFromCloudinary(reflection.videoUrl, localFileName);
        mimeType = 'video/webm'; // Cloudinary typically serves mp4/webm, we'll default to webm for gemini
      } catch (downloadErr) {
         return res.status(500).json({ success: false, error: 'Failed to download video from Cloud for analysis retry.' });
      }
    } else {
      // Legacy local video
      filePath = resolveUploadPath(reflection.videoUrl);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'Local video file missing, cannot retry analysis.' });
      }
      const ext = filePath.split('.').pop().toLowerCase();
      mimeType = ext === 'mp4' ? 'video/mp4' : 'video/webm';
    }

    const User = require('../models/User');
    const user = await User.findById(req.userId).select('language').lean();

    const { jobId, queued } = await enqueueVideoAnalysis(
      { 
        reflectionId: reflection._id.toString(), 
        userId: req.userId, 
        userLanguage: user?.language || 'en',
        filePath, 
        mimeType, 
        title: reflection.title, 
        note: reflection.note,
        isCloudinary: !!reflection.cloudinaryPublicId 
      },
      processVideoJob
    );

    res.json({ success: true, data: { message: 'Retry initiated', jobId, queued, processingStatus: 'pending' } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/videos/:id/transcript
async function updateTranscript(req, res, next) {
  try {
    const { transcript } = req.body;
    if (typeof transcript !== 'string') {
      return res.status(400).json({ success: false, error: 'Transcript text is required.' });
    }
    const reflection = await VideoReflection.findOne({ _id: req.params.id, user: req.userId });
    if (!reflection) {
      return res.status(404).json({ success: false, error: 'Video reflection not found.' });
    }
    reflection.transcript = transcript;
    await reflection.save();
    res.json({ success: true, data: { transcript: reflection.transcript } });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/:id — Job status polling endpoint
async function getJob(req, res, next) {
  try {
    const status = await getJobStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/:id/progress — SSE stream for real-time job progress
function streamJobProgress(req, res) {
  addClient(req.params.id, res);
}

module.exports = {
  uploadVideo,
  getVideos,
  deleteVideo,
  searchVideos,
  retryAnalysis,
  updateTranscript,
  getJob,
  streamJobProgress,
};
