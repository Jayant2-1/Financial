/**
 * Advanced filtering with DSL, operators, and type coercion
 */

function buildMongoFilter(filters, allowedFields = {}) {
  const query = { deletedAt: null };

  Object.entries(filters).forEach(([field, value]) => {
    if (!value || !allowedFields[field]) return;

    const fieldConfig = allowedFields[field];

    switch (fieldConfig.type) {
      case 'string':
        if (fieldConfig.searchable) {
          query[field] = { $regex: value, $options: 'i' };
        } else {
          query[field] = value;
        }
        break;

      case 'enum':
        query[field] = value;
        break;

      case 'date':
        if (!query[field]) query[field] = {};
        if (value.from) query[field].$gte = new Date(value.from);
        if (value.to) query[field].$lte = new Date(value.to);
        break;

      case 'number':
        if (!query[field]) query[field] = {};
        if (value.min !== undefined) query[field].$gte = value.min;
        if (value.max !== undefined) query[field].$lte = value.max;
        break;

      case 'boolean':
        query[field] = value === 'true' || value === true;
        break;

      default:
        break;
    }
  });

  return query;
}

function defineFilterSchema(schema) {
  return Object.entries(schema).reduce((acc, [field, config]) => {
    acc[field] = {
      type: config.type || 'string',
      searchable: config.searchable || false,
      operator: config.operator || 'eq'
    };
    return acc;
  }, {});
}

module.exports = {
  buildMongoFilter,
  defineFilterSchema
};
