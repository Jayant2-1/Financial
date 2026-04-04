const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  adminSetupKey: process.env.ADMIN_SETUP_KEY || 'bootstrap-admin-key',
  logLevel: process.env.LOG_LEVEL || 'info'
};

if (env.nodeEnv !== 'test') {
  ['databaseUrl', 'jwtAccessSecret', 'jwtRefreshSecret'].forEach((k) => {
    if (!env[k]) throw new Error(`Missing required env var: ${k}`);
  });
}

module.exports = env;
