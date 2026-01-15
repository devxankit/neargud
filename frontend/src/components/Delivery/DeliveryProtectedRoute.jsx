import { Navigate, useLocation } from 'react-router-dom';
import { useDeliveryAuthStore } from '../../store/deliveryAuthStore';

const DeliveryProtectedRoute = ({ children }) => {
  const { isAuthenticated, deliveryBoy, logout } = useDeliveryAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/delivery/login" state={{ from: location }} replace />;
  }

  if (deliveryBoy?.status === 'pending') {
    // Optionally logout if pending, or just redirect to a pending page
    // For now, let's redirect to login with a message
    return <Navigate to="/delivery/login" state={{ message: 'Your account is pending admin approval.' }} replace />;
  }

  if (deliveryBoy?.status === 'suspended') {
    return <Navigate to="/delivery/login" state={{ message: 'Your account has been suspended.' }} replace />;
  }

  return children;
};

export default DeliveryProtectedRoute;

