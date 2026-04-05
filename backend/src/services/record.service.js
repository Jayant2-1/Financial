const { NotFoundError } = require('../utils/ApiError');
const recordRepo = require('../repositories/record.repository');
const { toRecordDTO } = require('../dtos/record.dto');

async function createRecord(payload, userId) {
  const record = await recordRepo.createRecord({ ...payload, createdBy: userId });
  return toRecordDTO(record);
}

async function getRecord(id) {
  const record = await recordRepo.findById(id);
  if (!record) throw new NotFoundError('Record');
  return toRecordDTO(record);
}

async function listRecords(query) {
  const { limit = 20, offset = 0, sortBy, ...filters } = query;
  const { items, total } = await recordRepo.listRecords(filters, limit, offset, sortBy);
  return { items: items.map(toRecordDTO), total };
}

async function updateRecord(id, payload) {
  const record = await recordRepo.updateRecord(id, payload);
  if (!record) throw new NotFoundError('Record');
  return toRecordDTO(record);
}

async function deleteRecord(id) {
  const record = await recordRepo.softDeleteRecord(id);
  if (!record) throw new NotFoundError('Record');
  return toRecordDTO(record);
}

module.exports = { createRecord, getRecord, listRecords, updateRecord, deleteRecord };
