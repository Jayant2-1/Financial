const Record = require('../models/record.model');
const { RECORD_TYPES } = require('../constants/app.constants');
const { parseOffsetPagination, parseSorting } = require('../utils/pagination');

function buildFilter({ type, category, date, dateFrom, dateTo, search, tags, createdBy }) {
  const query = { deletedAt: null };

  if (createdBy) {
    query.createdBy = createdBy;
  }

  if (type && Object.values(RECORD_TYPES).includes(type)) {
    query.type = type;
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (date) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  } else if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  if (search) {
    query.$or = [
      { notes: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  return query;
}

async function createRecord(data) {
  const record = new Record(data);
  return record.save();
}

async function findById(id, createdBy = null) {
  const query = { _id: id, deletedAt: null };
  if (createdBy) {
    query.createdBy = createdBy;
  }

  return Record.findOne(query).populate('createdBy', 'email role');
}

async function listRecords(filters, limit, offset, sortBy, createdBy = null) {
  const query = buildFilter({ ...filters, createdBy });
  const { limit: parsedLimit, offset: parsedOffset } = parseOffsetPagination(limit, offset);
  const sortObj = parseSorting(sortBy);

  const [items, total] = await Promise.all([
    Record.find(query)
      .sort(sortObj)
      .skip(parsedOffset)
      .limit(parsedLimit)
      .populate('createdBy', 'email role')
      .lean(),
    Record.countDocuments(query)
  ]);

  return { items, total };
}

async function updateRecord(id, data, createdBy = null) {
  const query = { _id: id, deletedAt: null };
  if (createdBy) {
    query.createdBy = createdBy;
  }

  return Record.findOneAndUpdate(query, data, { new: true }).populate('createdBy', 'email role');
}

async function softDeleteRecord(id, createdBy = null) {
  const query = { _id: id, deletedAt: null };
  if (createdBy) {
    query.createdBy = createdBy;
  }

  return Record.findOneAndUpdate(
    query,
    { deletedAt: new Date() },
    { new: true }
  );
}

async function summary({ dateFrom, dateTo }, createdBy = null) {
  const match = { deletedAt: null };
  if (createdBy) {
    match.createdBy = createdBy;
  }

  if (dateFrom || dateTo) {
    match.date = {};
    if (dateFrom) match.date.$gte = new Date(dateFrom);
    if (dateTo) match.date.$lte = new Date(dateTo);
  }

  const [totals, byCategory, recent] = await Promise.all([
    Record.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]),
    Record.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]),
    Record.find(match).sort({ date: -1, createdAt: -1 }).limit(5).populate('createdBy', 'email')
  ]);

  return { totals, byCategory, recent };
}

async function monthlyTrends({ dateFrom, dateTo }, createdBy = null) {
  const match = { deletedAt: null };
  if (createdBy) {
    match.createdBy = createdBy;
  }

  if (dateFrom || dateTo) {
    match.date = {};
    if (dateFrom) match.date.$gte = new Date(dateFrom);
    if (dateTo) match.date.$lte = new Date(dateTo);
  }

  return Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
}

module.exports = {
  createRecord,
  findById,
  listRecords,
  updateRecord,
  softDeleteRecord,
  summary,
  monthlyTrends
};
