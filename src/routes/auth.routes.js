const express = require('express');
const controller = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Bootstrap first admin only
 *     tags: [Auth]
 */
router.post('/register', validateBody(registerSchema), controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email/password
 *     tags: [Auth]
 */
router.post('/login', validateBody(loginSchema), controller.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and issue new access token
 *     tags: [Auth]
 */
router.post('/refresh', controller.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.post('/logout', verifyToken, controller.logout);

module.exports = router;
