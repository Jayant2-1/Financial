const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { TOKEN_TYPES } = require('../constants/app.constants');
const refreshRepo = require('../repositories/refreshToken.repository');

function signAccessToken(user) {
  return jwt.sign(
    { role: user.role, email: user.email, type: TOKEN_TYPES.ACCESS },
    env.jwtAccessSecret,
    {
      subject: user.id || user._id.toString(),
      expiresIn: env.jwtAccessExpiresIn,
      issuer: 'finance-backend',
      audience: 'finance-api'
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { type: TOKEN_TYPES.REFRESH },
    env.jwtRefreshSecret,
    {
      subject: user.id || user._id.toString(),
      expiresIn: env.jwtRefreshExpiresIn,
      issuer: 'finance-backend',
      audience: 'finance-api'
    }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshExpiryDate() {
  const now = Date.now();
  const ttlMs = parseInt(env.jwtRefreshExpiresIn) || 7 * 24 * 60 * 60 * 1000;
  return new Date(now + ttlMs);
}

async function rotateRefreshToken(user, ipAddress, userAgent) {
  const refreshToken = signRefreshToken(user);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshExpiryDate();

  await refreshRepo.upsertByUserId(
    user.id || user._id.toString(),
    tokenHash,
    expiresAt,
    ipAddress,
    userAgent
  );

  return refreshToken;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  rotateRefreshToken,
  hashToken,
  TOKEN_TYPES
};
