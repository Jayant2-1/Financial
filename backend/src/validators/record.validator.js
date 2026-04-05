const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().min(1).max(100).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().allow('').max(1000).default(''),
  createdBy: Joi.string().trim().length(24).hex()
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().min(1).max(100),
  date: Joi.date().iso(),
  notes: Joi.string().allow('').max(1000)
}).min(1);

const listRecordsQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim(),
  date: Joi.date().iso(),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')),
  search: Joi.string().trim().allow(''),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

module.exports = { createRecordSchema, updateRecordSchema, listRecordsQuerySchema };
