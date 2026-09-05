// utils/logger.js
// Structured JSON logger using Winston.
// Every log line includes a requestId (injected via middleware) for end-to-end tracing.
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'mindmirror-api' },
  transports: [
    new transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? format.json()
          : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;
