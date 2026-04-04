/**
 * Request context manager - captures correlation IDs, request timing, user context
 * Enables request tracing across async boundaries
 */

const { v4: uuidv4 } = require('uuid');

const asyncLocalStorage = new (require('async_hooks').AsyncLocalStorage)();

function createRequestContext() {
  return {
    correlationId: uuidv4(),
    requestId: uuidv4(),
    startTime: Date.now(),
    user: null,
    method: null,
    path: null,
    ipAddress: null,
    userAgent: null,
    metadata: {}
  };
}

function getCurrentContext() {
  return asyncLocalStorage.getStore() || createRequestContext();
}

function setContext(context) {
  asyncLocalStorage.enterWith(context);
}

function getContextMiddleware(req, _res, next) {
  const context = createRequestContext();
  context.method = req.method;
  context.path = req.path;
  context.ipAddress = req.ip;
  context.userAgent = req.get('user-agent');

  asyncLocalStorage.run(context, () => {
    req.context = context;
    next();
  });
}

function getCorrelationId() {
  return getCurrentContext().correlationId;
}

function getUserContext() {
  return getCurrentContext().user;
}

function getRequestTiming() {
  const ctx = getCurrentContext();
  return Date.now() - ctx.startTime;
}

module.exports = {
  createRequestContext,
  getCurrentContext,
  setContext,
  getContextMiddleware,
  getCorrelationId,
  getUserContext,
  getRequestTiming
};
