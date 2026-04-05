const { toRecordDTO } = require('./record.dto');

function toSummaryDTO({ totals, byCategory, recent }) {
  const income = totals.find((x) => x._id === 'income')?.total || 0;
  const expense = totals.find((x) => x._id === 'expense')?.total || 0;

  return {
    totalIncome: income,
    totalExpenses: expense,
    netBalance: income - expense,
    categoryTotals: byCategory.map((x) => ({ category: x._id, total: x.total })),
    recentActivity: recent.map(toRecordDTO)
  };
}

function toTrendDTO(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const period = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
    if (!map.has(period)) map.set(period, { period, income: 0, expense: 0, net: 0 });
    map.get(period)[r._id.type] = r.total;
  });

  return Array.from(map.values()).map((x) => ({ ...x, net: x.income - x.expense }));
}

module.exports = { toSummaryDTO, toTrendDTO };
