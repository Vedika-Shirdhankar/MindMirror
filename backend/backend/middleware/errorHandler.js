// middleware/errorHandler.js

/**
 * Catches errors thrown/passed via next(err) in any route and
 * returns a consistent JSON error shape instead of leaking stack traces.
 * Must be registered LAST in server.js, after all routes.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `That ${field} is already in use.` });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Something went wrong on the server.' });
}

module.exports = { errorHandler };