// middleware/errorHandler.js
// Centralized error handling middleware.
// Must be registered LAST in server.js (after all routes).
// Produces consistent JSON error responses with requestId for tracing.

const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const requestId = req.requestId || 'unknown';
  logger.error({
    message: 'Unhandled error',
    requestId,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, error: 'Validation failed', details });
  }

  // Mongoose duplicate key (e.g. email already in use)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ success: false, error: `That ${field} is already in use.` });
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File is too large. Maximum size is 200 MB.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }

  // Intentionally thrown HTTP errors (e.g. const err = new Error('...'); err.status = 403)
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred.'
      : err.message || 'Something went wrong.';

  res.status(status).json({ success: false, error: message, requestId });
}

module.exports = { errorHandler };