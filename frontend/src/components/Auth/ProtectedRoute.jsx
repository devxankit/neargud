import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if screen is desktop (≥1024px)
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkDesktop();
    
    // Listen for resize events
    window.addEventListener('resize', checkDesktop);
    
    return () => {
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  if (!isAuthenticated) {
    // Guest access allowed for some routes, but we are in ProtectedRoute component
    // which means this specific route IS protected.
    // However, if we want to allow guest access generally but protect specific actions,
    // we should NOT wrap the whole app or public routes in ProtectedRoute.
    // The user request is "allow guest users to access the app".
    // So we need to ensure that ProtectedRoute is ONLY used for routes that absolutely require login
    // like Profile, Orders, Checkout, etc.
    
    // If accessing /app/* route on desktop view, redirect to desktop login
    const isAppRoute = location.pathname.startsWith('/app');
    
    if (isAppRoute && isDesktop) {
      // Redirect to desktop login page when accessing /app/* routes on desktop
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (isAppRoute) {
      // Redirect to mobile app login for /app/* routes on mobile
      return <Navigate to="/app/login" state={{ from: location }} replace />;
    }
    
    // Default redirect to desktop login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

