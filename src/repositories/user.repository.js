const User = require('../models/user.model');

function countUsers() {
  return User.countDocuments({ deletedAt: null });
}

function createUser(data) {
  return User.create(data);
}

function findByEmailWithPassword(email) {
  return User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash');
}

function findById(id) {
  return User.findOne({ _id: id, deletedAt: null });
}

async function listUsers({ limit, offset }) {
  const [items, total] = await Promise.all([
    User.find({ deletedAt: null }).sort({ createdAt: -1 }).skip(offset).limit(limit),
    User.countDocuments({ deletedAt: null })
  ]);
  return { items, total };
}

function updateUser(id, data) {
  return User.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true });
}

function softDeleteUser(id) {
  return User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );
}

module.exports = {
  countUsers,
  createUser,
  findByEmailWithPassword,
  findById,
  listUsers,
  updateUser,
  softDeleteUser
};
