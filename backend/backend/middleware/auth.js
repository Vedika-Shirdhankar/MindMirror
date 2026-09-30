// middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { logSecurityEvent, SecurityEvent } = require('../utils/auditLogger');

/**
 * Protects a route — requires a valid JWT in the Authorization header.
 * Usage: router.get('/path', requireAuth, controllerFn)
 * Populates req.userId on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    logSecurityEvent({
      event: SecurityEvent.UNAUTHORIZED_ACCESS,
      status: 'WARNING',
      req,
      metadata: { path: req.originalUrl, reason: 'Missing Authorization header' },
    });
    return res.status(401).json({ success: false, error: 'No token provided. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    if (!payload || !payload.userId) {
      logSecurityEvent({
        event: SecurityEvent.UNAUTHORIZED_ACCESS,
        status: 'WARNING',
        req,
        metadata: { path: req.originalUrl, reason: 'Invalid token payload' },
      });
      return res.status(401).json({ success: false, error: 'Invalid token payload. Please log in again.' });
    }
    req.userId = payload.userId;
    next();
  } catch (err) {
    logSecurityEvent({
      event: SecurityEvent.UNAUTHORIZED_ACCESS,
      status: 'WARNING',
      req,
      metadata: { path: req.originalUrl, error: err.message },
    });
    logger.warn({ message: 'Auth failed', requestId: req.requestId, error: err.message });
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = { requireAuth };