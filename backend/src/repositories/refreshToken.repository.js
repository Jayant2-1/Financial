const RefreshToken = require('../models/refreshToken.model');

async function upsertByUserId(userId, tokenHash, expiresAt, ipAddress, userAgent) {
  return RefreshToken.findOneAndUpdate(
    { userId },
    {
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
      revokedAt: null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function findByUserId(userId) {
  return RefreshToken.findOne({ userId });
}

async function deleteByUserId(userId) {
  return RefreshToken.deleteOne({ userId });
}

async function revokeByUserId(userId) {
  return RefreshToken.findOneAndUpdate(
    { userId },
    { revokedAt: new Date() },
    { new: true }
  );
}

module.exports = { upsertByUserId, findByUserId, deleteByUserId, revokeByUserId };
