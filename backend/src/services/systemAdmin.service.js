const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { logger } = require('../config/logger');
const User = require('../models/user.model');
const Record = require('../models/record.model');

const DEMO_ANALYSTS = [
  { email: 'analyst1@finnova.local', password: 'Analyst@1001' },
  { email: 'analyst2@finnova.local', password: 'Analyst@1002' },
  { email: 'analyst3@finnova.local', password: 'Analyst@1003' },
  { email: 'analyst4@finnova.local', password: 'Analyst@1004' },
  { email: 'analyst5@finnova.local', password: 'Analyst@1005' }
];

const DEMO_VIEWERS = [
  { email: 'user1@finnova.local', password: 'User@1001' },
  { email: 'user2@finnova.local', password: 'User@1002' },
  { email: 'user3@finnova.local', password: 'User@1003' },
  { email: 'user4@finnova.local', password: 'User@1004' },
  { email: 'user5@finnova.local', password: 'User@1005' }
];

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

async function ensureDemoUsers() {
  if (env.nodeEnv === 'test' || !env.seedDemoUsersOnStartup) {
    return;
  }

  for (const account of DEMO_ANALYSTS) {
    // eslint-disable-next-line no-await-in-loop
    await createUserIfMissing({ ...account, role: 'analyst' });
  }

  for (const account of DEMO_VIEWERS) {
    // eslint-disable-next-line no-await-in-loop
    await createUserIfMissing({ ...account, role: 'viewer' });
  }
}

function buildDemoRecords(userIds) {
  const now = new Date();
  const categories = ['salary', 'food', 'rent', 'transport', 'utilities', 'investment', 'shopping'];
  const records = [];

  userIds.forEach((userId, idx) => {
    for (let i = 0; i < 10; i += 1) {
      const isIncome = (idx + i) % 4 === 0;
      const amount = isIncome ? 2200 + idx * 80 + i * 40 : 90 + idx * 15 + i * 12;
      const daysAgo = idx * 3 + i * 4;
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);

      records.push({
        amount,
        type: isIncome ? 'income' : 'expense',
        category: isIncome ? 'salary' : categories[(idx + i) % categories.length],
        date,
        notes: `Demo seeded ${isIncome ? 'income' : 'expense'} for dashboard`,
        createdBy: userId,
        tags: ['seed-demo-v1'],
        metadata: { source: 'api' }
      });
    }
  });

  return records;
}

async function ensureDemoRecords() {
  if (env.nodeEnv === 'test' || !env.seedDemoRecordsOnStartup) {
    return;
  }

  const targetCount = 100;
  const existing = await Record.countDocuments({ tags: 'seed-demo-v1', deletedAt: null });

  const seededEmails = [...DEMO_ANALYSTS.map((a) => a.email), ...DEMO_VIEWERS.map((u) => u.email)].map((e) => e.toLowerCase());
  const users = await User.find({ email: { $in: seededEmails }, deletedAt: null }).select('_id email');

  if (!users.length) {
    logger.warn('Demo users not found. Skipping demo record seeding.');
    return;
  }

  if (existing >= targetCount) {
    return;
  }

  const candidates = buildDemoRecords(users.map((u) => u._id));
  const needed = Math.max(targetCount - existing, 0);
  const recordsToInsert = candidates.slice(0, needed);

  if (recordsToInsert.length) {
    await Record.insertMany(recordsToInsert);
    logger.info(`Seeded demo records: ${recordsToInsert.length}`);
  }
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

module.exports = { ensureSystemAdmin, ensureDemoUsers, ensureDemoRecords };
