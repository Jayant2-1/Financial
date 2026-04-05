const { AuthorizationError } = require('../utils/ApiError');
const { PERMISSIONS } = require('../constants/app.constants');

function requireRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User context not found'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`Role '${req.user.role}' not authorized for this action`));
    }

    next();
  };
}

function checkPermission(permission) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User context not found'));
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasPermission = userPermissions.some((p) => p === '*' || p === permission || p.endsWith(':*'));

    if (!hasPermission) {
      return next(new AuthorizationError(`Permission '${permission}' denied`));
    }

    next();
  };
}

module.exports = { requireRoles, checkPermission };
