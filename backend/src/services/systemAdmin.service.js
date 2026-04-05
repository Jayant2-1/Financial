const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { logger } = require('../config/logger');
const User = require('../models/user.model');

async function createUserIfMissing({ email, password, role }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (existing) {
    if (existing.role !== role || !existing.isActive || existing.deletedAt) {
      existing.role = role;
      existing.isActive = true;
      existing.deletedAt = null;
      await existing.save();
      logger.info(`Seeded user role ensured: ${normalizedEmail} (${role})`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    isActive: true,
    deletedAt: null
  });
  logger.info(`Seeded user created: ${normalizedEmail} (${role})`);
}

async function ensureInitialUsers() {
  if (env.nodeEnv === 'test' || !env.seedInitialUsersOnStartup) {
    return;
  }

  await createUserIfMissing({
    email: env.initialAnalystEmail,
    password: env.initialAnalystPassword,
    role: 'analyst'
  });

  await createUserIfMissing({
    email: env.initialViewerEmail,
    password: env.initialViewerPassword,
    role: 'viewer'
  });
}

async function ensureSystemAdmin() {
  if (env.nodeEnv === 'test' || !env.seedSystemAdminOnStartup) {
    return;
  }

  const email = env.systemAdminEmail.toLowerCase();
  const existing = await User.findOne({ email }).select('+passwordHash');

  if (existing) {
    if (existing.role !== 'admin' || !existing.isActive || existing.deletedAt) {
      existing.role = 'admin';
      existing.isActive = true;
      existing.deletedAt = null;
      await existing.save();
      logger.info(`System admin role ensured: ${email}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(env.systemAdminPassword, env.bcryptSaltRounds);
  await User.create({
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
    deletedAt: null
  });
  logger.info(`System admin created: ${email}`);
}

module.exports = { ensureSystemAdmin, ensureInitialUsers };
