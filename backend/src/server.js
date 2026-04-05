const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { logger } = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/db');

const server = http.createServer(app);

async function start() {
  await connectDatabase();
  server.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
}

async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Force shutdown due to timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error({ message: 'Unhandled rejection', reason });
});

start().catch((err) => {
  logger.error({ message: 'Startup failure', error: err.message });
  process.exit(1);
});
