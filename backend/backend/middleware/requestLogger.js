// middleware/requestLogger.js
// Injects a unique requestId into every request and logs all incoming requests
// and their responses using the structured Winston logger.
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userAgent: req.headers['user-agent'],
    };

    if (duration > 2000) {
      logger.warn({ ...logData, message: 'Slow request detected' });
    } else if (res.statusCode >= 500) {
      logger.error({ ...logData, message: 'Server error response' });
    } else if (res.statusCode >= 400) {
      logger.warn({ ...logData, message: 'Client error response' });
    } else {
      logger.info({ ...logData, message: 'Request completed' });
    }
  });

  next();
}

module.exports = { requestLogger };
