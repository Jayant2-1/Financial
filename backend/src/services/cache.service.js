const { createClient } = require('redis');
const env = require('../config/env');
const { logger } = require('../config/logger');

let client = null;
let ready = false;

async function initializeCache() {
  if (!env.redisUrl) {
    return;
  }

  if (client && ready) {
    return;
  }

  try {
    client = createClient({ url: env.redisUrl });
    client.on('error', (err) => {
      logger.warn(`Redis client error: ${err.message}`);
    });
    await client.connect();
    ready = true;
    logger.info('Redis cache connected');
  } catch (err) {
    ready = false;
    logger.warn(`Redis unavailable, continuing without cache: ${err.message}`);
  }
}

async function disconnectCache() {
  if (client && ready) {
    await client.quit();
    ready = false;
    client = null;
    logger.info('Redis cache disconnected');
  }
}

async function getCache(key) {
  if (!ready || !client) return null;

  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

async function setCache(key, value, ttlSec) {
  if (!ready || !client) return;
  await client.set(key, JSON.stringify(value), { EX: ttlSec });
}

async function deleteByPrefix(prefix) {
  if (!ready || !client) return;

  let cursor = '0';
  do {
    // eslint-disable-next-line no-await-in-loop
    const result = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
    cursor = result.cursor;
    const keys = result.keys || [];
    if (keys.length) {
      // eslint-disable-next-line no-await-in-loop
      await client.del(keys);
    }
  } while (cursor !== '0');
}

module.exports = {
  initializeCache,
  disconnectCache,
  getCache,
  setCache,
  deleteByPrefix
};
