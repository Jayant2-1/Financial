function toRecordDTO(record) {
  return {
    id: record._id.toString(),
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    createdBy: record.createdBy.toString ? record.createdBy.toString() : record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

module.exports = { toRecordDTO };
