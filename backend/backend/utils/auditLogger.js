// utils/auditLogger.js — Security Audit Logging for Sensitive & Security-Critical Events
const logger = require('./logger');

const SecurityEvent = {
  LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
  SIGNUP_SUCCESS: 'AUTH_SIGNUP_SUCCESS',
  PASSWORD_CHANGE_SUCCESS: 'AUTH_PASSWORD_CHANGE_SUCCESS',
  PASSWORD_CHANGE_FAILURE: 'AUTH_PASSWORD_CHANGE_FAILURE',
  UNAUTHORIZED_ACCESS: 'AUTH_UNAUTHORIZED_ACCESS',
  DATA_EXPORT: 'DATA_EXPORT_REQUESTED',
  ACCOUNT_DELETION: 'ACCOUNT_DELETION_REQUESTED',
  SUSPICIOUS_INPUT: 'SUSPICIOUS_INPUT_DETECTED',
  SUPPORT_PREFERENCES_UPDATED: 'SUPPORT_PREFERENCES_UPDATED',
  FUTURE_SELF_MESSAGE_CREATED: 'FUTURE_SELF_MESSAGE_CREATED',
  FUTURE_SELF_MESSAGE_DELETED: 'FUTURE_SELF_MESSAGE_DELETED',
};

/**
 * Extracts client IP from Express request safely
 */
function getClientIp(req) {
  if (!req) return 'unknown';
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

/**
 * Logs a structured security audit event
 * @param {Object} params
 * @param {string} params.event - One of SecurityEvent types
 * @param {string} [params.userId] - ID of user if authenticated
 * @param {Object} [params.req] - Express request object
 * @param {string} params.status - 'SUCCESS' | 'FAILURE' | 'WARNING'
 * @param {Object} [params.metadata] - Non-sensitive context details
 */
function logSecurityEvent({ event, userId = null, req = null, status = 'SUCCESS', metadata = {} }) {
  const auditPayload = {
    audit: true,
    eventType: event,
    userId: userId || req?.userId || null,
    ip: getClientIp(req),
    userAgent: req?.headers?.['user-agent'] || 'unknown',
    timestamp: new Date().toISOString(),
    status,
    ...metadata,
  };

  if (status === 'FAILURE' || status === 'WARNING') {
    logger.warn({ message: `[SECURITY AUDIT] ${event}`, ...auditPayload });
  } else {
    logger.info({ message: `[SECURITY AUDIT] ${event}`, ...auditPayload });
  }

  return auditPayload;
}

module.exports = {
  SecurityEvent,
  logSecurityEvent,
  getClientIp,
};
