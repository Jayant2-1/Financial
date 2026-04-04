const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { NotFoundError, ConflictError } = require('../utils/ApiError');
const { parseOffsetPagination } = require('../utils/pagination');
const userRepo = require('../repositories/user.repository');
const { toUserDTO } = require('../dtos/user.dto');

async function createUser(payload) {
  const existing = await userRepo.findByEmailWithPassword(payload.email);
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
  const user = await userRepo.createUser({
    email: payload.email,
    passwordHash,
    role: payload.role,
    isActive: payload.isActive
  });
  return toUserDTO(user);
}

async function listUsers(query) {
  const pagination = parseOffsetPagination(query.limit, query.offset);
  const { items, total } = await userRepo.listUsers(pagination);
  return { items: items.map(toUserDTO), total };
}

async function updateUser(id, payload) {
  const update = { ...payload };
  if (payload.password) {
    update.passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
    delete update.password;
  }

  const user = await userRepo.updateUser(id, update);
  if (!user) throw new NotFoundError('User');
  return toUserDTO(user);
}

async function deleteUser(id) {
  const user = await userRepo.softDeleteUser(id);
  if (!user) throw new NotFoundError('User');
  return toUserDTO(user);
}

module.exports = { createUser, listUsers, updateUser, deleteUser };
