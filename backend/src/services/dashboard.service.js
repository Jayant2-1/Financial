const recordRepo = require('../repositories/record.repository');
const { toSummaryDTO, toTrendDTO } = require('../dtos/dashboard.dto');
const env = require('../config/env');
const { getCache, setCache, deleteByPrefix } = require('./cache.service');

const SUMMARY_CACHE_PREFIX = 'dashboard:summary:';

function resolveOwnerId(user) {
  if (!user || user.role === 'admin') {
    return null;
  }

  return user.id;
}

function buildSummaryCacheKey(query = {}, user = null) {
  const ownerId = resolveOwnerId(user);
  const normalized = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  normalized.scope = ownerId ? `user:${ownerId}` : 'global';

  return `${SUMMARY_CACHE_PREFIX}${JSON.stringify(normalized)}`;
}

async function getSummary(query, user) {
  const cacheKey = buildSummaryCacheKey(query, user);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const ownerId = resolveOwnerId(user);
  const raw = await recordRepo.summary(query, ownerId);
  const summary = toSummaryDTO(raw);
  await setCache(cacheKey, summary, env.dashboardSummaryCacheTtlSec);
  return summary;
}

async function getTrends(query, user) {
  const ownerId = resolveOwnerId(user);
  const raw = await recordRepo.monthlyTrends(query, ownerId);
  return toTrendDTO(raw);
}

async function invalidateDashboardSummaryCache() {
  await deleteByPrefix(SUMMARY_CACHE_PREFIX);
}

module.exports = { getSummary, getTrends, invalidateDashboardSummaryCache };
