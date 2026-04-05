const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || process.env.MONGODB_URL || process.env.MONGO_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  corsOrigin:
    process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://127.0.0.1:5173,http://[::1]:5173',
  adminSetupKey: process.env.ADMIN_SETUP_KEY || 'bootstrap-admin-key',
  allowBootstrapAdmin:
    process.env.ALLOW_BOOTSTRAP_ADMIN
      ? process.env.ALLOW_BOOTSTRAP_ADMIN === 'true'
      : process.env.NODE_ENV !== 'production',
  seedSystemAdminOnStartup: process.env.SEED_SYSTEM_ADMIN_ON_STARTUP === 'true',
  seedInitialUsersOnStartup: process.env.SEED_INITIAL_USERS_ON_STARTUP === 'true',
  redisUrl: process.env.REDIS_URL || '',
  dashboardSummaryCacheTtlSec: Number(process.env.DASHBOARD_SUMMARY_CACHE_TTL_SEC || 120),
  systemAdminEmail: process.env.SYSTEM_ADMIN_EMAIL || '',
  systemAdminPassword: process.env.SYSTEM_ADMIN_PASSWORD || '',
  initialAnalystEmail: process.env.INITIAL_ANALYST_EMAIL || '',
  initialAnalystPassword: process.env.INITIAL_ANALYST_PASSWORD || '',
  initialViewerEmail: process.env.INITIAL_VIEWER_EMAIL || '',
  initialViewerPassword: process.env.INITIAL_VIEWER_PASSWORD || '',
  logLevel: process.env.LOG_LEVEL || 'info'
};

if (env.nodeEnv !== 'test') {
  if (!env.databaseUrl) {
    throw new Error('Missing required env var: DATABASE_URL (or MONGODB_URL / MONGO_URL)');
  }

  ['jwtAccessSecret', 'jwtRefreshSecret'].forEach((k) => {
    if (!env[k]) throw new Error(`Missing required env var: ${k}`);
  });

  if (env.nodeEnv === 'production') {
    if (!process.env.CORS_ORIGIN) {
      throw new Error('CORS_ORIGIN must be set in production');
    }

    if (env.seedSystemAdminOnStartup && (!env.systemAdminEmail || !env.systemAdminPassword)) {
      throw new Error('SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD are required when SEED_SYSTEM_ADMIN_ON_STARTUP=true');
    }

    if (
      env.seedInitialUsersOnStartup
      && (!env.initialAnalystEmail
        || !env.initialAnalystPassword
        || !env.initialViewerEmail
        || !env.initialViewerPassword)
    ) {
      throw new Error('INITIAL_ANALYST_EMAIL, INITIAL_ANALYST_PASSWORD, INITIAL_VIEWER_EMAIL, INITIAL_VIEWER_PASSWORD are required when SEED_INITIAL_USERS_ON_STARTUP=true');
    }
  }
}

module.exports = env;
