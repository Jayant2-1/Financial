const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.query);
  res.status(200).json(data);
});

const trends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTrends(req.query);
  res.status(200).json({ trends: data });
});

module.exports = { summary, trends };
