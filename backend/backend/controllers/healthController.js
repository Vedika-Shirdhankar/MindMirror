// controllers/healthController.js
// Deep health check endpoint — production pattern for Kubernetes/load balancer probes.
// Returns 200 if healthy, 503 if any critical dependency is down.

const mongoose = require('mongoose');
const os = require('os');
const config = require('../config');
const { getQueueMetrics } = require('../services/jobQueue');
const { getMetrics: getSseMetrics } = require('../services/sseService');
const { geminiCircuitBreaker } = require('../utils/circuitBreaker');
const { cache } = require('../utils/cache');

async function checkHealth(req, res) {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const queueMetrics = getQueueMetrics();
  const sseMetrics = getSseMetrics();
  const cacheStats = cache.stats();

  const health = {
    status: mongoStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      mongodb: mongoStatus,
      redis: queueMetrics.ready ? 'connected' : 'unavailable',
      gemini: config.gemini.apiKey ? 'configured' : 'missing_key',
      circuitBreaker: {
        gemini: geminiCircuitBreaker.getState(),
      },
    },
    queues: {
      videoAnalysis: {
        ready: queueMetrics.ready,
        name: queueMetrics.name,
      },
    },
    realtime: {
      activeJobStreams: sseMetrics.activeJobs,
      totalSseConnections: sseMetrics.totalConnections,
    },
    cache: cacheStats,
    features: config.features,
    system: {
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg().map((v) => v.toFixed(2)),
    },
  };

  const statusCode = mongoStatus === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
}

module.exports = { checkHealth };
