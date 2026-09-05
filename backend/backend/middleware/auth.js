// middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Protects a route — requires a valid JWT in the Authorization header.
 * Usage: router.get('/path', requireAuth, controllerFn)
 * Populates req.userId on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.userId = payload.userId;
    next();
  } catch (err) {
    logger.warn({ message: 'Auth failed', requestId: req.requestId, error: err.message });
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = { requireAuth };