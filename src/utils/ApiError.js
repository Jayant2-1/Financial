/**
 * Enhanced ApiError with error codes, correlation IDs, and structured metadata
 */

const { getCorrelationId } = require('./requestContext');
const { ERROR_CODES } = require('../constants/app.constants');

class ApiError extends Error {
  constructor(statusCode, message, errorCode = null, details = [], metadata = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode || ERROR_CODES.INTERNAL_ERROR;
    this.details = Array.isArray(details) ? details : [details];
    this.metadata = metadata;
    this.correlationId = getCorrelationId();
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.statusCode,
        errorCode: this.errorCode,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
        correlationId: this.correlationId,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

class ValidationError extends ApiError {
  constructor(details = []) {
    super(400, 'Validation failed', ERROR_CODES.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', errorCode = ERROR_CODES.AUTH_FAILED) {
    super(401, message, errorCode);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message, ERROR_CODES.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, ERROR_CODES.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(409, message, ERROR_CODES.CONFLICT);
    this.name = 'ConflictError';
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
