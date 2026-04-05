import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  amount: 0,
  type: 'expense',
  category: 'general',
  date: new Date().toISOString().slice(0, 10),
  notes: ''
};

const initialFilters = {
  type: 'all',
  category: '',
  dateFrom: '',
  dateTo: ''
};

function RecordsPage() {
  const { request, hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, pages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowBusyId, setRowBusyId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  const canCreate = hasRole('admin');

  function getRecordId(record) {
    return record.id || record._id;
  }

  async function loadRecords(nextOffset = pagination.offset, nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(nextOffset)
      });

      if (nextFilters.type && nextFilters.type !== 'all') {
        params.set('type', nextFilters.type);
      }

      const normalizedCategory = nextFilters.category.trim();
      if (normalizedCategory) {
        params.set('category', normalizedCategory);
      }

      if (nextFilters.dateFrom) {
        params.set('dateFrom', nextFilters.dateFrom);
      }

      if (nextFilters.dateTo) {
        params.set('dateTo', nextFilters.dateTo);
      }

      const data = await request(`/records?${params.toString()}`);
      setRecords(data.items || []);
      setPagination((prev) => ({ ...prev, ...(data.pagination || {}), offset: nextOffset }));
    } catch (err) {
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRecord(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await request('/records', {
        method: 'POST',
        body: {
          ...form,
          amount: Number(form.amount)
        }
      });
      setForm(initialForm);
      await loadRecords(0);
    } catch (err) {
      setError(err.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(record) {
    setEditingId(getRecordId(record));
    setEditForm({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: String(record.date).slice(0, 10),
      notes: record.notes || ''
    });
  }

  function cancelEdit() {
    setEditingId('');
    setEditForm(initialForm);
  }

  async function saveEdit(record) {
    const id = getRecordId(record);
    setRowBusyId(id);
    setError('');

    try {
      await request(`/records/${id}`, {
        method: 'PUT',
        body: {
          ...editForm,
          amount: Number(editForm.amount)
        }
      });
      cancelEdit();
      await loadRecords(pagination.offset);
    } catch (err) {
      setError(err.message || 'Failed to update record');
    } finally {
      setRowBusyId('');
    }
  }

  async function removeRecord(record) {
    const id = getRecordId(record);
    setRowBusyId(id);
    setError('');

    try {
      await request(`/records/${id}`, { method: 'DELETE' });
      if (editingId === id) {
        cancelEdit();
      }
      const expectedOffset = records.length === 1 && pagination.offset > 0 ? Math.max(pagination.offset - pagination.limit, 0) : pagination.offset;
      await loadRecords(expectedOffset);
    } catch (err) {
      setError(err.message || 'Failed to delete record');
    } finally {
      setRowBusyId('');
    }
  }

  async function applyFilters(e) {
    e.preventDefault();
    await loadRecords(0, filters);
  }

  async function clearFilters() {
    const resetFilters = { ...initialFilters };
    setFilters(resetFilters);
    await loadRecords(0, resetFilters);
  }

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h2>Financial Records</h2>
        <button className="btn-secondary" onClick={() => loadRecords(pagination.offset)} disabled={loading}>
          Reload
        </button>
      </div>

      {error ? <p className="alert error">{error}</p> : null}

      {canCreate ? (
        <form className="card formGrid" onSubmit={createRecord}>
          <h3>Create Record</h3>
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>

          <label className="field">
            <span>Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </label>

          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </label>

          <label className="field full">
            <span>Notes</span>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Create'}
          </button>
        </form>
      ) : null}

      <form className="card formGrid" onSubmit={applyFilters}>
        <h3>Filters</h3>

        <label className="field">
          <span>Type</span>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="all">all</option>
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <input
            value={filters.category}
            placeholder="e.g. salary"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Date from</span>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </label>

        <label className="field">
          <span>Date to</span>
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </label>

        <div className="rowActions filterActions full">
          <button className="btn-primary" type="submit" disabled={loading}>
            Apply Filters
          </button>
          <button className="btn-secondary" type="button" onClick={clearFilters} disabled={loading}>
            Clear
          </button>
        </div>
      </form>

      <article className="card tableCard">
        <div className="sectionHeader">
          <h3>Record List</h3>
          <div className="paginationControls">
            <button
              className="btn-secondary"
              onClick={() => loadRecords(Math.max(pagination.offset - pagination.limit, 0))}
              disabled={loading || !pagination.hasPrev}
            >
              Prev
            </button>
            <span className="muted">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} / {pagination.pages || 1}
            </span>
            <button
              className="btn-secondary"
              onClick={() => loadRecords(pagination.offset + pagination.limit)}
              disabled={loading || !pagination.hasNext}
            >
              Next
            </button>
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading records...</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  {canCreate ? <th>User</th> : null}
                  {canCreate ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={getRecordId(row)}>
                    <td>
                      {editingId === getRecordId(row) ? (
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        />
                      ) : (
                        new Date(row.date).toLocaleDateString()
                      )}
                    </td>
                    <td>
                      {editingId === getRecordId(row) ? (
                        <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                          <option value="income">income</option>
                          <option value="expense">expense</option>
                        </select>
                      ) : (
                        row.type
                      )}
                    </td>
                    <td>
                      {editingId === getRecordId(row) ? (
                        <input
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      ) : (
                        row.category
                      )}
                    </td>
                    <td>
                      {editingId === getRecordId(row) ? (
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        />
                      ) : (
                        `$${row.amount}`
                      )}
                    </td>
                    <td>
                      {editingId === getRecordId(row) ? (
                        <input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                      ) : (
                        row.notes || '-'
                      )}
                    </td>
                    {canCreate ? <td>{row.createdBy?.email || row.createdBy || '-'}</td> : null}
                    {canCreate ? (
                      <td>
                        <div className="rowActions">
                          {editingId === getRecordId(row) ? (
                            <>
                              <button
                                className="btn-primary"
                                type="button"
                                onClick={() => saveEdit(row)}
                                disabled={rowBusyId === getRecordId(row)}
                              >
                                Save
                              </button>
                              <button
                                className="btn-secondary"
                                type="button"
                                onClick={cancelEdit}
                                disabled={rowBusyId === getRecordId(row)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-secondary"
                                type="button"
                                onClick={() => startEdit(row)}
                                disabled={rowBusyId === getRecordId(row)}
                              >
                                Update
                              </button>
                              <button
                                className="btn-danger"
                                type="button"
                                onClick={() => removeRecord(row)}
                                disabled={rowBusyId === getRecordId(row)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {!records.length ? (
                  <tr>
                    <td colSpan={canCreate ? 7 : 5} className="muted">
                      No records available.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default RecordsPage;
