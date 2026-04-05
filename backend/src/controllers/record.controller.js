const asyncHandler = require('../utils/asyncHandler');
const recordService = require('../services/record.service');
const { createPaginationResponse } = require('../utils/pagination');

const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user);
  res.status(201).json(record);
});

const getRecord = asyncHandler(async (req, res) => {
  const record = await recordService.getRecord(req.params.id, req.user);
  res.status(200).json(record);
});

const listRecords = asyncHandler(async (req, res) => {
  const { items, total, limit, offset } = await recordService.listRecords(req.query, req.user);
  const pagination = createPaginationResponse(items, total, limit, offset);
  res.status(200).json(pagination);
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body, req.user);
  res.status(200).json(record);
});

const deleteRecord = asyncHandler(async (req, res) => {
  const record = await recordService.deleteRecord(req.params.id, req.user);
  res.status(200).json(record);
});

module.exports = { createRecord, getRecord, listRecords, updateRecord, deleteRecord };
