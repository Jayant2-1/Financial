const express = require('express');
const controller = require('../controllers/record.controller');
const { validateBody, validateQuery } = require('../middlewares/validate.middleware');
const { createRecordSchema, updateRecordSchema, listRecordsQuerySchema } = require('../validators/record.validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /records:
 *   get:
 *     summary: List records with filters (analyst/admin)
 *     tags: [Records]
 *   post:
 *     summary: Create record (admin)
 *     tags: [Records]
 */
router.get('/', verifyToken, requireRoles('analyst', 'admin'), validateQuery(listRecordsQuerySchema), controller.listRecords);
router.post('/', verifyToken, requireRoles('admin'), validateBody(createRecordSchema), controller.createRecord);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get single record
 *     tags: [Records]
 *   put:
 *     summary: Update record (admin)
 *     tags: [Records]
 *   delete:
 *     summary: Soft delete record (admin)
 *     tags: [Records]
 */
router.get('/:id', verifyToken, requireRoles('analyst', 'admin'), controller.getRecord);
router.put('/:id', verifyToken, requireRoles('admin'), validateBody(updateRecordSchema), controller.updateRecord);
router.delete('/:id', verifyToken, requireRoles('admin'), controller.deleteRecord);

module.exports = router;
