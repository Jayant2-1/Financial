/**
 * Enhanced logger with structured logging, context correlation, and performance metrics
 */

const winston = require('winston');
const env = require('./env');
const { getCorrelationId, getRequestTiming } = require('../utils/requestContext');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'gray'
};

winston.addColors(colors);

function createLogger() {
  return winston.createLogger({
    level: env.logLevel || 'info',
    levels,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'finance-backend', version: '1.0.0' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const correlationId = getCorrelationId();
            const timing = getRequestTiming();
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `[${timestamp}] ${level}: [${correlationId}] [${timing}ms] ${message} ${metaStr}`;
          })
        )
      }),
      ...(env.nodeEnv === 'production'
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 5242880,
              maxFiles: 5
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 5242880,
              maxFiles: 10
            })
          ]
        : [])
    ]
  });
}

const logger = createLogger();

function logRequest(req, res, duration) {
  const logData = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
}

function logError(error, context = {}) {
  const errorData = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
    errorCode: error.errorCode,
    stack: error.stack,
    ...context
  };

  logger.error('Error occurred', errorData);
}

module.exports = {
  logger,
  logRequest,
  logError
};
