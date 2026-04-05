const { NotFoundError } = require('../utils/ApiError');
const recordRepo = require('../repositories/record.repository');
const { toRecordDTO } = require('../dtos/record.dto');
const { parseOffsetPagination } = require('../utils/pagination');
const { invalidateDashboardSummaryCache } = require('./dashboard.service');
const userRepository = require('../repositories/user.repository');

function resolveOwnerId(user) {
  if (!user || user.role === 'admin') {
    return null;
  }

  return user.id;
}

async function createRecord(payload, user) {
  const actorId = user.id;
  let ownerId = actorId;

  if (user.role === 'admin' && payload.createdBy) {
    const targetUser = await userRepository.findById(payload.createdBy);
    if (targetUser) {
      ownerId = targetUser._id.toString();
    }
  }

  const sanitizedPayload = { ...payload };
  delete sanitizedPayload.createdBy;

  const record = await recordRepo.createRecord({ ...sanitizedPayload, createdBy: ownerId });
  await invalidateDashboardSummaryCache();
  return toRecordDTO(record);
}

async function getRecord(id, user) {
  const ownerId = resolveOwnerId(user);
  const record = await recordRepo.findById(id, ownerId);
  if (!record) throw new NotFoundError('Record');
  return toRecordDTO(record);
}

async function listRecords(query, user) {
  const { sortBy, ...filters } = query;
  const pagination = parseOffsetPagination(query.limit, query.offset);
  const ownerId = resolveOwnerId(user);
  const { items, total } = await recordRepo.listRecords(filters, pagination.limit, pagination.offset, sortBy, ownerId);
  return {
    items: items.map(toRecordDTO),
    total,
    limit: pagination.limit,
    offset: pagination.offset
  };
}

async function updateRecord(id, payload, user) {
  const ownerId = resolveOwnerId(user);
  const record = await recordRepo.updateRecord(id, payload, ownerId);
  if (!record) throw new NotFoundError('Record');
  await invalidateDashboardSummaryCache();
  return toRecordDTO(record);
}

async function deleteRecord(id, user) {
  const ownerId = resolveOwnerId(user);
  const record = await recordRepo.softDeleteRecord(id, ownerId);
  if (!record) throw new NotFoundError('Record');
  await invalidateDashboardSummaryCache();
  return toRecordDTO(record);
}

module.exports = { createRecord, getRecord, listRecords, updateRecord, deleteRecord };
