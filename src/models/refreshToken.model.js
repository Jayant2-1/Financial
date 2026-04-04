const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    },
    revokedAt: {
      type: Date,
      default: null
    },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

refreshTokenSchema.virtual('isRevoked').get(function () {
  return this.revokedAt !== null;
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
