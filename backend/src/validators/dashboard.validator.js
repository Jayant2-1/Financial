const Joi = require('joi');

const dateRangeQuerySchema = Joi.object({
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom'))
});

module.exports = { dateRangeQuerySchema };
