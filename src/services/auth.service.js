const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AuthenticationError, ConflictError } = require('../utils/ApiError');
const { ERROR_CODES, HTTP_STATUS } = require('../constants/app.constants');
const userRepo = require('../repositories/user.repository');
const refreshRepo = require('../repositories/refreshToken.repository');
const { toUserDTO } = require('../dtos/user.dto');
const { signAccessToken, rotateRefreshToken, hashToken } = require('./token.service');

async function registerBootstrapAdmin({ email, password, setupKey }) {
  if (setupKey !== env.adminSetupKey) {
    throw new AuthenticationError('Invalid setup key', ERROR_CODES.INVALID_SETUP_KEY);
  }

  const userCount = await userRepo.countUsers();
  if (userCount > 0) {
    throw new ConflictError('Bootstrap disabled after first admin created');
  }

  const existing = await userRepo.findByEmailWithPassword(email);
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await userRepo.createUser({ email, passwordHash, role: 'admin', isActive: true });
  return toUserDTO(user);
}

async function login({ email, password }, ipAddress, userAgent) {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user) throw new AuthenticationError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
  if (!user.isActive) throw new AuthenticationError('User is inactive', ERROR_CODES.USER_INACTIVE);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AuthenticationError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);

  const userDto = toUserDTO(user);
  const accessToken = signAccessToken({ ...userDto, _id: user._id });
  const refreshToken = await rotateRefreshToken({ ...userDto, _id: user._id }, ipAddress, userAgent);

  await userRepo.updateUser(user._id.toString(), { lastLoginAt: new Date() });

  return { user: userDto, accessToken, refreshToken };
}

async function refresh(refreshTokenRaw, ipAddress, userAgent) {
  if (!refreshTokenRaw) throw new AuthenticationError('Missing refresh token', ERROR_CODES.UNAUTHORIZED);

  let payload;
  try {
    payload = jwt.verify(refreshTokenRaw, env.jwtRefreshSecret);
  } catch (err) {
    const errorCode = err.name === 'TokenExpiredError' ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.TOKEN_INVALID;
    throw new AuthenticationError('Invalid refresh token', errorCode);
  }

  const row = await refreshRepo.findByUserId(payload.sub);
  if (!row || row.isRevoked) throw new AuthenticationError('Refresh token revoked', ERROR_CODES.UNAUTHORIZED);

  if (row.tokenHash !== hashToken(refreshTokenRaw)) {
    await refreshRepo.deleteByUserId(payload.sub);
    throw new AuthenticationError('Token rotation violation', ERROR_CODES.TOKEN_ROTATION_VIOLATION);
  }

  const user = await userRepo.findById(payload.sub);
  if (!user || !user.isActive) throw new AuthenticationError('Inactive user', ERROR_CODES.USER_INACTIVE);

  const userDto = toUserDTO(user);
  const accessToken = signAccessToken({ ...userDto, _id: user._id });
  const refreshToken = await rotateRefreshToken({ ...userDto, _id: user._id }, ipAddress, userAgent);

  return { user: userDto, accessToken, refreshToken };
}

async function logout(userId) {
  await refreshRepo.revokeByUserId(userId);
}

module.exports = { registerBootstrapAdmin, login, refresh, logout };
