// services/jobQueue.js
// BullMQ-based background job queue for long-running AI tasks.
// Workers run in the same process for simplicity; in a scaled deployment
// workers would be in separate processes/containers.
//
// Architecture: API layer enqueues a job and immediately returns a jobId.
// The worker processes the job asynchronously and updates MongoDB on completion.
// The frontend polls GET /api/jobs/:id or subscribes via SSE for live updates.
//
// Interview discussion points:
//   - Decoupling: API and CPU-bound AI work are separate concerns
//   - Backpressure: BullMQ limits concurrency to protect Gemini rate limits
//   - Observability: Every job has a status lifecycle (waiting→active→completed/failed)
//   - Durability: BullMQ persists jobs in Redis, so a server crash doesn't lose work

const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

let videoQueue = null;
let videoWorker = null;
let queueEvents = null;
let connection = null;
let isQueueReady = false;

const QUEUE_NAME = 'video-analysis';

/**
 * Attempts to connect to Redis and set up the BullMQ queue.
 * Fails gracefully — if Redis is unavailable, the queue is disabled and
 * videos fall back to synchronous (fire-and-forget) processing.
 */
async function initJobQueue(processorFn) {
  try {
    connection = new IORedis(config.redis.url, {
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 3000,
      retryStrategy: () => null, // don't auto-retry — we handle fallback manually
    });

    // Suppress unhandled error events — errors are handled below
    connection.on('error', (err) => {
      logger.warn({ message: 'Redis connection error', error: err.message });
    });

    // Race connect() against a 3-second timeout so we never block server startup
    await Promise.race([
      connection.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connect timeout after 3s')), 3000)
      ),
    ]);

    videoQueue = new Queue(QUEUE_NAME, { connection });
    queueEvents = new QueueEvents(QUEUE_NAME, { connection });

    videoWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        logger.info({ message: 'Processing job', jobId: job.id, jobName: job.name });
        return processorFn(job);
      },
      { connection, concurrency: 2 } // process 2 videos at a time
    );

    videoWorker.on('completed', (job) => {
      logger.info({ message: 'Job completed', jobId: job.id });
    });

    videoWorker.on('failed', (job, err) => {
      logger.error({ message: 'Job failed', jobId: job?.id, error: err.message });
    });

    isQueueReady = true;
    logger.info({ message: 'BullMQ job queue initialized', queue: QUEUE_NAME });
  } catch (err) {
    logger.warn({
      message: 'Redis unavailable — job queue disabled, falling back to synchronous processing',
      error: err.message,
    });
    // Close the failed connection to prevent open handle leaks
    if (connection) {
      try { connection.disconnect(); } catch (_) { /* ignore */ }
    }
    isQueueReady = false;
  }
}

/**
 * Adds a video analysis job to the queue.
 * Returns the job ID for status polling.
 * If Redis is unavailable, runs the processor synchronously (fallback).
 */
async function enqueueVideoAnalysis(data, processorFn) {
  if (isQueueReady && videoQueue) {
    const job = await videoQueue.add('analyzeVideo', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 3600 }, // keep for 1 hour for status queries
      removeOnFail: { age: 86400 },    // keep failed jobs for 24 hours
    });
    logger.info({ message: 'Job enqueued', jobId: job.id, reflectionId: data.reflectionId });
    return { jobId: job.id, queued: true };
  } else {
    // Graceful degradation: run synchronously in background (fire-and-forget)
    logger.warn({ message: 'Queue not ready — running synchronously', reflectionId: data.reflectionId });
    processorFn({ data }).catch((err) =>
      logger.error({ message: 'Sync fallback failed', reflectionId: data.reflectionId, error: err.message })
    );
    return { jobId: null, queued: false };
  }
}

/**
 * Gets the current status of a job by ID.
 */
async function getJobStatus(jobId) {
  if (!isQueueReady || !videoQueue) return null;
  try {
    const { Job } = require('bullmq');
    const job = await Job.fromId(videoQueue, jobId);
    if (!job) return null;
    const state = await job.getState();
    return {
      jobId: job.id,
      state,
      progress: job.progress,
      failedReason: job.failedReason || null,
    };
  } catch {
    return null;
  }
}

function getQueueMetrics() {
  return { ready: isQueueReady, name: QUEUE_NAME };
}

module.exports = { initJobQueue, enqueueVideoAnalysis, getJobStatus, getQueueMetrics, getVideoQueue: () => videoQueue };
