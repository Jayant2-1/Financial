/**
 * Request timing and logging middleware
 */

const { logRequest } = require('../config/logger');

function requestTimingMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });

  next();
}

module.exports = { requestTimingMiddleware };
