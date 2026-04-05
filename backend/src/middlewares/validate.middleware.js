/**
 * Enhanced validation middleware with detailed error reporting
 */

const { ValidationError } = require('../utils/ApiError');

function validateBody(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      context: { method: 'body' }
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
        type: d.type
      }));
      return next(new ValidationError(details));
    }

    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      context: { method: 'query' }
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
        type: d.type
      }));
      return next(new ValidationError(details));
    }

    req.query = value;
    next();
  };
}

function validateParams(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      context: { method: 'params' }
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
        type: d.type
      }));
      return next(new ValidationError(details));
    }

    req.params = value;
    next();
  };
}

module.exports = { validateBody, validateQuery, validateParams };
