import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initialUserForm = {
  email: '',
  password: '',
  role: 'viewer',
  isActive: true
};

function UsersPage() {
  const { request } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, pages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowBusyId, setRowBusyId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ role: 'viewer', isActive: true, password: '' });
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialUserForm);

  function getUserId(user) {
    return user.id || user._id;
  }

  async function loadUsers(nextOffset = pagination.offset) {
    setLoading(true);
    setError('');
    try {
      const data = await request(`/users?limit=${pagination.limit}&offset=${nextOffset}`);
      setUsers(data.items || []);
      setPagination((prev) => ({ ...prev, ...(data.pagination || {}), offset: nextOffset }));
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await request('/users', { method: 'POST', body: form });
      setForm(initialUserForm);
      await loadUsers(0);
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(user) {
    const id = getUserId(user);
    setEditingId(id);
    setEditForm({
      role: user.role,
      isActive: Boolean(user.isActive),
      password: ''
    });
  }

  function cancelEdit() {
    setEditingId('');
    setEditForm({ role: 'viewer', isActive: true, password: '' });
  }

  async function saveEdit(user) {
    const id = getUserId(user);
    setRowBusyId(id);
    setError('');

    try {
      const payload = {
        role: editForm.role,
        isActive: editForm.isActive
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      await request(`/users/${id}`, { method: 'PUT', body: payload });
      cancelEdit();
      await loadUsers(pagination.offset);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setRowBusyId('');
    }
  }

  async function deleteUser(user) {
    const id = getUserId(user);
    setRowBusyId(id);
    setError('');

    try {
      await request(`/users/${id}`, { method: 'DELETE' });
      if (editingId === id) {
        cancelEdit();
      }
      const expectedOffset = users.length === 1 && pagination.offset > 0 ? Math.max(pagination.offset - pagination.limit, 0) : pagination.offset;
      await loadUsers(expectedOffset);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setRowBusyId('');
    }
  }

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h2>User Administration</h2>
        <button className="btn-secondary" onClick={() => loadUsers(pagination.offset)} disabled={loading}>
          Refresh
        </button>
      </div>

      {error ? <p className="alert error">{error}</p> : null}

      <form className="card formGrid" onSubmit={handleCreate}>
        <h3>Create User</h3>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>

        <label className="field">
          <span>Role</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="viewer">viewer</option>
            <option value="analyst">analyst</option>
            <option value="admin">admin</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={String(form.isActive)}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          >
            <option value="true">active</option>
            <option value="false">inactive</option>
          </select>
        </label>

        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create User'}
        </button>
      </form>

      <article className="card tableCard">
        <div className="sectionHeader">
          <h3>Users</h3>
          <div className="paginationControls">
            <button
              className="btn-secondary"
              onClick={() => loadUsers(Math.max(pagination.offset - pagination.limit, 0))}
              disabled={loading || !pagination.hasPrev}
            >
              Prev
            </button>
            <span className="muted">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} / {pagination.pages || 1}
            </span>
            <button
              className="btn-secondary"
              onClick={() => loadUsers(pagination.offset + pagination.limit)}
              disabled={loading || !pagination.hasNext}
            >
              Next
            </button>
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading users...</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={getUserId(u)}>
                    <td>{u.email}</td>
                    <td>
                      {editingId === getUserId(u) ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          <option value="viewer">viewer</option>
                          <option value="analyst">analyst</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td>
                      {editingId === getUserId(u) ? (
                        <select
                          value={String(editForm.isActive)}
                          onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        >
                          <option value="true">active</option>
                          <option value="false">inactive</option>
                        </select>
                      ) : u.isActive ? (
                        'active'
                      ) : (
                        'inactive'
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="rowActions">
                        {editingId === getUserId(u) ? (
                          <>
                            <input
                              type="password"
                              placeholder="new password (optional)"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            />
                            <button className="btn-primary" type="button" onClick={() => saveEdit(u)} disabled={rowBusyId === getUserId(u)}>
                              Save
                            </button>
                            <button className="btn-secondary" type="button" onClick={cancelEdit} disabled={rowBusyId === getUserId(u)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-secondary" type="button" onClick={() => startEdit(u)} disabled={rowBusyId === getUserId(u)}>
                              Update
                            </button>
                            <button className="btn-danger" type="button" onClick={() => deleteUser(u)} disabled={rowBusyId === getUserId(u)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      No users found.
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

export default UsersPage;
