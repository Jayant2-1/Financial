import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

function App() {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [output, setOutput] = useState('Ready');
  const [loading, setLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    email: 'admin@test.com',
    password: 'AdminPass123!',
    setupKey: 'bootstrap-admin-key'
  });

  const [loginForm, setLoginForm] = useState({
    email: 'admin@test.com',
    password: 'AdminPass123!'
  });

  const [userForm, setUserForm] = useState({
    email: 'viewer@test.com',
    password: 'ViewerPass123!',
    role: 'viewer',
    isActive: true
  });

  const [recordForm, setRecordForm] = useState({
    amount: 1200,
    type: 'income',
    category: 'salary',
    date: '2026-04-01',
    notes: 'April salary'
  });

  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  async function callApi(path, options = {}) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      const data = await res.json();
      setOutput(JSON.stringify({ status: res.status, data }, null, 2));

      if (path === '/auth/login' && res.ok && data?.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        setToken(data.data.accessToken);
      }

      if (path === '/auth/refresh' && res.ok && data?.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        setToken(data.data.accessToken);
      }
    } catch (err) {
      setOutput(String(err));
    } finally {
      setLoading(false);
    }
  }

  function logoutLocal() {
    localStorage.removeItem('accessToken');
    setToken('');
  }

  return (
    <div className="page">
      <h1>Finance Backend Tester</h1>
      <p>
        API Base: <code>{API_BASE}</code>
      </p>

      <section className="card">
        <h2>1) Bootstrap Admin</h2>
        <div className="grid">
          <input
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          />
          <input
            placeholder="Setup Key"
            value={registerForm.setupKey}
            onChange={(e) => setRegisterForm({ ...registerForm, setupKey: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          onClick={() =>
            callApi('/auth/register', {
              method: 'POST',
              body: JSON.stringify(registerForm)
            })
          }
        >
          Register Bootstrap Admin
        </button>
      </section>

      <section className="card">
        <h2>2) Login / Refresh / Logout</h2>
        <div className="grid">
          <input
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
        </div>
        <div className="actions">
          <button
            disabled={loading}
            onClick={() =>
              callApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginForm)
              })
            }
          >
            Login
          </button>
          <button disabled={loading} onClick={() => callApi('/auth/refresh', { method: 'POST' })}>
            Refresh Token
          </button>
          <button disabled={loading} onClick={() => callApi('/auth/logout', { method: 'POST' })}>
            Logout API
          </button>
          <button onClick={logoutLocal}>Clear Local Token</button>
        </div>
        <p>
          Current token: <code>{token ? `${token.slice(0, 24)}...` : 'none'}</code>
        </p>
      </section>

      <section className="card">
        <h2>3) User Management (Admin)</h2>
        <div className="grid">
          <input
            placeholder="User Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <input
            placeholder="User Password"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="viewer">viewer</option>
            <option value="analyst">analyst</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="actions">
          <button
            disabled={loading}
            onClick={() => callApi('/users', { method: 'GET' })}
          >
            List Users
          </button>
          <button
            disabled={loading}
            onClick={() =>
              callApi('/users', {
                method: 'POST',
                body: JSON.stringify(userForm)
              })
            }
          >
            Create User
          </button>
        </div>
      </section>

      <section className="card">
        <h2>4) Records</h2>
        <div className="grid">
          <input
            type="number"
            placeholder="Amount"
            value={recordForm.amount}
            onChange={(e) => setRecordForm({ ...recordForm, amount: Number(e.target.value) })}
          />
          <select
            value={recordForm.type}
            onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
          >
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
          <input
            placeholder="Category"
            value={recordForm.category}
            onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })}
          />
          <input
            type="date"
            value={recordForm.date}
            onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
          />
          <input
            placeholder="Notes"
            value={recordForm.notes}
            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
          />
        </div>
        <div className="actions">
          <button disabled={loading} onClick={() => callApi('/records', { method: 'GET' })}>
            List Records
          </button>
          <button
            disabled={loading}
            onClick={() =>
              callApi('/records', {
                method: 'POST',
                body: JSON.stringify(recordForm)
              })
            }
          >
            Create Record
          </button>
        </div>
      </section>

      <section className="card">
        <h2>5) Dashboard</h2>
        <div className="actions">
          <button disabled={loading} onClick={() => callApi('/dashboard/summary', { method: 'GET' })}>
            Summary
          </button>
          <button disabled={loading} onClick={() => callApi('/dashboard/trends', { method: 'GET' })}>
            Trends
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Output</h2>
        <pre>{output}</pre>
      </section>
    </div>
  );
}

export default App;
