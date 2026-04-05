/**
 * Advanced pagination with cursor support and sorting
 */

const { PAGINATION } = require('../constants/app.constants');

function parseCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, PAGINATION.CURSOR_ENCODING).toString());
  } catch {
    return null;
  }
}

function encodeCursor(data) {
  return Buffer.from(JSON.stringify(data), 'utf-8').toString(PAGINATION.CURSOR_ENCODING);
}

function parseOffsetPagination(limit = PAGINATION.DEFAULT_LIMIT, offset = PAGINATION.DEFAULT_OFFSET) {
  const parsedLimit = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const parsedOffset = Math.max(parseInt(offset, 10) || PAGINATION.DEFAULT_OFFSET, 0);

  return {
    limit: parsedLimit,
    offset: parsedOffset,
    skip: parsedOffset,
    take: parsedLimit
  };
}

function createPaginationResponse(items, total, limit, offset) {
  return {
    items,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    }
  };
}

function parseSorting(sortBy) {
  if (!sortBy) return { createdAt: -1 };

  const sortObj = {};
  const sorts = Array.isArray(sortBy) ? sortBy : [sortBy];

  sorts.forEach((sort) => {
    const [field, direction] = sort.split(':');
    if (field) {
      sortObj[field] = direction === 'asc' ? 1 : -1;
    }
  });

  return sortObj;
}

module.exports = {
  parseOffsetPagination,
  createPaginationResponse,
  parseSorting,
  parseCursor,
  encodeCursor
};
