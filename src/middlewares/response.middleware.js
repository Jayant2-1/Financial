/**
 * Response interceptor middleware - adds correlation ID, timing, and response shaping
 */

const { getRequestTiming, getCorrelationId } = require('../utils/requestContext');

function responseInterceptor(req, res, next) {
  const originalJson = res.json;

  res.json = function (data) {
    const timing = getRequestTiming();
    const correlationId = getCorrelationId();

    const response = {
      success: data?.success !== false,
      data: data?.data || data,
      ...(process.env.NODE_ENV === 'development' && {
        _meta: {
          correlationId,
          timing: `${timing}ms`,
          timestamp: new Date().toISOString()
        }
      })
    };

    return originalJson.call(this, response);
  };

  next();
}

module.exports = { responseInterceptor };
