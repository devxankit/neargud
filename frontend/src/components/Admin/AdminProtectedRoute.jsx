import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuthStore();
  const location = useLocation();
  const hasToken = localStorage.getItem('admin-token');

  if (isLoading || (!isAuthenticated && hasToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login page with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
