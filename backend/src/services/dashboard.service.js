const recordRepo = require('../repositories/record.repository');
const { toSummaryDTO, toTrendDTO } = require('../dtos/dashboard.dto');

async function getSummary(query) {
  const raw = await recordRepo.summary(query);
  return toSummaryDTO(raw);
}

async function getTrends(query) {
  const raw = await recordRepo.monthlyTrends(query);
  return toTrendDTO(raw);
}

module.exports = { getSummary, getTrends };
