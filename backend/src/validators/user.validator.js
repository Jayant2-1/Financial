const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(72),
  role: Joi.string().valid('viewer', 'analyst', 'admin'),
  isActive: Joi.boolean()
}).min(1);

const listUsersQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

module.exports = { createUserSchema, updateUserSchema, listUsersQuerySchema };
