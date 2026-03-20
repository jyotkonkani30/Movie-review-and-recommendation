import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CinematicLoader from '../components/CinematicLoader';

/**
 * ProtectedRoute Component
 * Protects routes from unauthorized access
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CinematicLoader />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
