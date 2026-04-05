import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { checking, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="centerScreen">
        <div className="card loaderCard">Checking session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
