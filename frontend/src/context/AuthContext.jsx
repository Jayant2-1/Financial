import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const refreshed = await apiRequest('/auth/refresh', {
          method: 'POST'
        });
        setToken(refreshed?.accessToken || '');
        setUser(refreshed?.user || null);
      } catch {
        setToken('');
        setUser(null);
      } finally {
        setChecking(false);
      }
    }

    bootstrapSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(credentials) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        ...credentials,
        email: credentials?.email?.trim?.() || ''
      }
    });
    setToken(data.accessToken || '');
    setUser(data.user || null);
    return data;
  }

  async function registerBootstrapAdmin(payload) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: {
        ...payload,
        email: payload?.email?.trim?.() || '',
        setupKey: payload?.setupKey?.trim?.() || ''
      }
    });
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST', token });
    } finally {
      setToken('');
      setUser(null);
    }
  }

  async function request(path, options = {}) {
    return apiRequest(path, { ...options, token });
  }

  function hasRole(...roles) {
    if (!user?.role) return false;
    return roles.includes(user.role);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      checking,
      isAuthenticated: Boolean(token),
      hasRole,
      login,
      logout,
      request,
      registerBootstrapAdmin
    }),
    [token, user, checking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
