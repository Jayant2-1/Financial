const express = require('express');
const controller = require('../controllers/dashboard.controller');
const { validateQuery } = require('../middlewares/validate.middleware');
const { dateRangeQuerySchema } = require('../validators/dashboard.validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Totals, category totals, recent activity
 *     tags: [Dashboard]
 */
router.get('/summary', verifyToken, requireRoles('viewer', 'analyst', 'admin'), validateQuery(dateRangeQuerySchema), controller.summary);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Monthly trends by income/expense
 *     tags: [Dashboard]
 */
router.get('/trends', verifyToken, requireRoles('viewer', 'analyst', 'admin'), validateQuery(dateRangeQuerySchema), controller.trends);

module.exports = router;
