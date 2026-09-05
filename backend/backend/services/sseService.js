// services/sseService.js
// Server-Sent Events (SSE) manager for pushing real-time job progress to clients.
//
// How it works:
//   1. Client connects to GET /api/jobs/:id/progress
//   2. The server adds the response object to a registry keyed by jobId
//   3. When a background worker updates job progress, it calls pushProgress(jobId, data)
//   4. The SSE connection is closed when the job completes or the client disconnects
//
// Interview discussion:
//   - SSE is unidirectional (server → client), which is perfect for progress updates
//   - Simpler than WebSockets for this use case — no bidirectional communication needed
//   - Works through most HTTP/1.1 proxies and doesn't require a special upgrade

const logger = require('../utils/logger');

// Map of jobId -> Set of response objects (multiple tabs can watch same job)
const clients = new Map();

/**
 * Registers an SSE client for a given jobId.
 * Sets up heartbeat to keep the connection alive through proxies.
 */
function addClient(jobId, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
  res.flushHeaders();

  if (!clients.has(jobId)) {
    clients.set(jobId, new Set());
  }
  clients.get(jobId).add(res);
  logger.info({ message: 'SSE client connected', jobId, totalClients: clients.get(jobId).size });

  // Heartbeat every 25s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  res.on('close', () => {
    clearInterval(heartbeat);
    removeClient(jobId, res);
    logger.info({ message: 'SSE client disconnected', jobId });
  });

  // Send initial connection event
  sendToClient(res, 'connected', { jobId, message: 'Connected to job progress stream' });
}

function removeClient(jobId, res) {
  if (clients.has(jobId)) {
    clients.get(jobId).delete(res);
    if (clients.get(jobId).size === 0) {
      clients.delete(jobId);
    }
  }
}

function sendToClient(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Pushes a progress update to all clients watching a specific job.
 */
function pushProgress(jobId, data) {
  if (!clients.has(jobId)) return;
  const jobClients = clients.get(jobId);
  for (const res of jobClients) {
    sendToClient(res, 'progress', data);
  }
}

/**
 * Pushes a completion event and closes all SSE connections for this job.
 */
function pushComplete(jobId, data) {
  if (!clients.has(jobId)) return;
  const jobClients = clients.get(jobId);
  for (const res of jobClients) {
    sendToClient(res, 'complete', data);
    res.end();
  }
  clients.delete(jobId);
}

/**
 * Pushes a failure event and closes all SSE connections for this job.
 */
function pushError(jobId, error) {
  if (!clients.has(jobId)) return;
  const jobClients = clients.get(jobId);
  for (const res of jobClients) {
    sendToClient(res, 'error', { message: error });
    res.end();
  }
  clients.delete(jobId);
}

function getMetrics() {
  return { activeJobs: clients.size, totalConnections: [...clients.values()].reduce((sum, s) => sum + s.size, 0) };
}

module.exports = { addClient, pushProgress, pushComplete, pushError, getMetrics };
