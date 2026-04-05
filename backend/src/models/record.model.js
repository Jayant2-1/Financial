const mongoose = require('mongoose');
const { RECORD_TYPES } = require('../constants/app.constants');

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(RECORD_TYPES),
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 100
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
      text: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    metadata: {
      source: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
      ipAddress: String,
      userAgent: String
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

recordSchema.index({ date: -1, type: 1 });
recordSchema.index({ category: 1, deletedAt: 1 });
recordSchema.index({ createdBy: 1, deletedAt: 1 });
recordSchema.index({ 'notes': 'text' });

recordSchema.virtual('isDeleted').get(function () {
  return this.deletedAt !== null;
});

module.exports = mongoose.model('Record', recordSchema);
