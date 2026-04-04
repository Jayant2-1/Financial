const { NotFoundError } = require('../utils/ApiError');

function notFoundMiddleware(req, _res, next) {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
}

module.exports = { notFoundMiddleware };
