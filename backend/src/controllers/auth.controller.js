const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const env = require('../config/env');

function setAuthCookies(res, accessToken, refreshToken) {
  const secure = env.nodeEnv === 'production';
  const sameSite = env.nodeEnv === 'production' ? 'none' : 'lax';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 15 * 60 * 1000,
    path: '/'
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerBootstrapAdmin(req.body);
  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');
  const { user, accessToken, refreshToken } = await authService.login(req.body, ipAddress, userAgent);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(204).end();
  }

  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');
  const { user, accessToken, refreshToken } = await authService.refresh(token, ipAddress, userAgent);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
});

const bootstrapStatus = asyncHandler(async (_req, res) => {
  const status = await authService.getBootstrapStatus();
  res.status(200).json(status);
});

module.exports = { register, login, refresh, logout, bootstrapStatus };
