const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format'
      },
      index: { unique: true, sparse: true }
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
      minlength: 60
    },
    role: {
      type: String,
      enum: ['viewer', 'analyst', 'admin'],
      default: 'viewer',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

userSchema.compound_index = [
  ['deletedAt', 1],
  ['isActive', 1],
  ['role', 1]
];

userSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

module.exports = mongoose.model('User', userSchema);
