const mongoose = require('mongoose');
const env = require('./env');
const { logger } = require('./logger');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.databaseUrl);
  logger.info('MongoDB connected');
}

async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
}

module.exports = { connectDatabase, disconnectDatabase };
