import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RecordsPage from './pages/RecordsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/records"
        element={
          <ProtectedRoute roles={['analyst', 'admin']}>
            <AppShell>
              <RecordsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppShell>
              <UsersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <UnauthorizedPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
