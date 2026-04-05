const { logError } = require('../config/logger');
const { getCorrelationId } = require('../utils/requestContext');

function errorMiddleware(err, req, res, _next) {
  const correlationId = getCorrelationId();
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const details = Array.isArray(err.details) ? err.details : [];
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  logError(err, {
    correlationId,
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });

  const response = {
    success: false,
    error: {
      code: statusCode,
      errorCode,
      message,
      details,
      correlationId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(response);
}

module.exports = { errorMiddleware };
