import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const targetPath = location.state?.from || '/';

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginForm);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="centerScreen">
      <section className="authWrap card">
        <h1>Finance</h1>
        <p className="muted">Secure financial operations with role-based access control.</p>
        <p className="alert info">Sign in with your assigned admin/analyst/viewer credentials.</p>

        <form className="formStack" onSubmit={handleLogin}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error ? <p className="alert error">{error}</p> : null}
      </section>
    </div>
  );
}

export default LoginPage;
