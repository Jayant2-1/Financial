const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');
const { createPaginationResponse } = require('../utils/pagination');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

const listUsers = asyncHandler(async (req, res) => {
  const { items, total } = await userService.listUsers(req.query);
  const pagination = createPaginationResponse(items, total, req.query.limit, req.query.offset);
  res.status(200).json(pagination);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  res.status(200).json(user);
});

module.exports = { createUser, listUsers, updateUser, deleteUser };
