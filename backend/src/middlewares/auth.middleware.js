const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AuthenticationError } = require('../utils/ApiError');
const { ERROR_CODES } = require('../constants/app.constants');
const userRepository = require('../repositories/user.repository');

async function verifyToken(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = bearerToken || req.cookies?.accessToken;

    if (!token) {
      return next(new AuthenticationError('Missing access token', ERROR_CODES.UNAUTHORIZED));
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await userRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      return next(new AuthenticationError('Inactive or missing user', ERROR_CODES.USER_INACTIVE));
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired', ERROR_CODES.TOKEN_EXPIRED));
    }
    next(new AuthenticationError('Invalid token', ERROR_CODES.TOKEN_INVALID));
  }
}

module.exports = { verifyToken };
