function toRecordDTO(record) {
  let createdBy = record.createdBy;

  if (record.createdBy && typeof record.createdBy === 'object' && record.createdBy._id) {
    createdBy = {
      id: record.createdBy._id.toString(),
      email: record.createdBy.email,
      role: record.createdBy.role
    };
  } else if (record.createdBy?.toString) {
    createdBy = record.createdBy.toString();
  }

  return {
    id: record._id.toString(),
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

module.exports = { toRecordDTO };
