// services/videoWorker.js
// The actual BullMQ job processor for video analysis.
// This is the function passed to initJobQueue() — it runs in the worker thread.
//
// It reads job.data, does the AI analysis, updates MongoDB, and pushes
// SSE progress events at each stage so the frontend shows live status.

const VideoReflection = require('../models/VideoReflection');
const { analyzeVideoReflection } = require('../utils/videoAnalysis');
const { generateEmbedding } = require('../utils/embeddings');
const { extractAndSaveActions } = require('../utils/actionExtractor');
const { geminiCircuitBreaker } = require('../utils/circuitBreaker');
const { pushProgress, pushComplete, pushError } = require('./sseService');
const logger = require('../utils/logger');

async function processVideoJob(job) {
  const { reflectionId, userId, userLanguage = 'en', filePath, mimeType, title, note } = job.data;
  const jobId = job.id;

  logger.info({ message: 'Video job started', jobId, reflectionId });

  try {
    // Stage 1: Mark as processing
    await VideoReflection.updateOne({ _id: reflectionId }, { processingStatus: 'processing' });
    pushProgress(jobId, { stage: 'processing', message: 'Analyzing your video with AI...' });
    if (typeof job.updateProgress === 'function') await job.updateProgress(10);

    // Stage 2: AI Analysis (via Circuit Breaker with retry + exponential backoff)
    const analysis = await geminiCircuitBreaker.call(
      () => analyzeVideoReflection(filePath, mimeType, userLanguage),
      () => {
        logger.warn({ message: 'Gemini unavailable, using fallback analysis', reflectionId });
        return {
          transcript: '[AI analysis temporarily unavailable. Please retry later.]',
          summary: '',
          themes: [],
          triggers: [],
          sentiment: 'neutral',
          mood_score: 5,
          actionsMentioned: [],
          aiGeneratedInsights: 'AI analysis is temporarily unavailable.',
        };
      }
    );

    pushProgress(jobId, { stage: 'transcribed', message: 'Transcript generated. Building insights...' });
    if (typeof job.updateProgress === 'function') await job.updateProgress(60);

    // Stage 3: Save all analysis fields to MongoDB
    await VideoReflection.updateOne({ _id: reflectionId }, {
      transcript: analysis.transcript,
      summary: analysis.summary,
      themes: analysis.themes,
      triggers: analysis.triggers,
      sentiment: analysis.sentiment,
      mood_score: analysis.mood_score,
      actionsMentioned: analysis.actionsMentioned,
      aiGeneratedInsights: analysis.aiGeneratedInsights,
      dominant_emotion: analysis.dominant_emotion,
      secondary_emotions: analysis.secondary_emotions,
      emotional_patterns: analysis.emotional_patterns,
      recurring_thoughts: analysis.recurring_thoughts,
      cognitive_distortions: analysis.cognitive_distortions,
      gratitude_points: analysis.gratitude_points,
      coping_suggestions: analysis.coping_suggestions,
      positive_affirmations: analysis.positive_affirmations,
      actionable_next_steps: analysis.actionable_next_steps,
      anxiety_indicators: analysis.anxiety_indicators,
      burnout_indicators: analysis.burnout_indicators,
      stress_level: analysis.stress_level,
      risk_level: analysis.risk_level,
      needs_support: analysis.needs_support,
      processingStatus: 'completed',
    });

    pushProgress(jobId, { stage: 'embedding', message: 'Generating semantic embeddings...' });
    if (typeof job.updateProgress === 'function') await job.updateProgress(80);

    // Stage 4: Generate embeddings for semantic search
    const searchableText = `${title}\n${note}\n${analysis.transcript}\n${analysis.summary}`;
    if (searchableText.trim()) {
      try {
        const vec = await generateEmbedding(searchableText);
        await VideoReflection.updateOne({ _id: reflectionId }, { embedding: vec });
        extractAndSaveActions(searchableText, 'VideoReflection', reflectionId, userId);
      } catch (embErr) {
        logger.warn({ message: 'Embedding failed (non-fatal)', error: embErr.message, reflectionId });
      }
    }

    if (typeof job.updateProgress === 'function') await job.updateProgress(100);
    pushComplete(jobId, { reflectionId, message: 'Video analysis complete!' });
    logger.info({ message: 'Video job completed', jobId, reflectionId });

    return { reflectionId, status: 'completed' };
  } catch (err) {
    logger.error({ message: 'Video job failed', jobId, reflectionId, error: err.message, stack: err.stack });
    await VideoReflection.updateOne({ _id: reflectionId }, { processingStatus: 'failed' });
    pushError(jobId, `Analysis failed: ${err.message}`);
    throw err; // Re-throw so BullMQ can mark job as failed and retry
  } finally {
    if (job.data.isCloudinary) {
      const { deleteFile } = require('./storageService');
      deleteFile(job.data.filePath);
    }
  }
}

module.exports = { processVideoJob };
