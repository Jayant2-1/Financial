const express = require('express');
const controller = require('../controllers/user.controller');
const { validateBody, validateQuery } = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema, listUsersQuerySchema } = require('../validators/user.validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (admin)
 *     tags: [Users]
 *   post:
 *     summary: Create user (admin)
 *     tags: [Users]
 */
router.get('/', verifyToken, requireRoles('admin'), validateQuery(listUsersQuerySchema), controller.listUsers);
router.post('/', verifyToken, requireRoles('admin'), validateBody(createUserSchema), controller.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (admin)
 *     tags: [Users]
 *   delete:
 *     summary: Soft delete user (admin)
 *     tags: [Users]
 */
router.put('/:id', verifyToken, requireRoles('admin'), validateBody(updateUserSchema), controller.updateUser);
router.delete('/:id', verifyToken, requireRoles('admin'), controller.deleteUser);

module.exports = router;
