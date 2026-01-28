import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token based on request URL (more reliable than window path)
    let token = null;
    const url = config.url || '';

    if (url.includes('/admin/')) {
      token = localStorage.getItem('admin-token');
    } else if (url.includes('/vendor/')) {
      token = localStorage.getItem('vendor-token');
    } else if (url.includes('/delivery/')) {
      token = localStorage.getItem('delivery-token');
    } else if (url.includes('/user/') || url.includes('/auth/user/')) {
      token = localStorage.getItem('token');
    }

    // Fallback context-based token if specific token not found
    if (!token) {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        token = localStorage.getItem('admin-token');
      } else if (path.startsWith('/vendor')) {
        token = localStorage.getItem('vendor-token');
      } else if (path.startsWith('/delivery')) {
        token = localStorage.getItem('delivery-token');
      } else {
        token = localStorage.getItem('token');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Show error toast
    // Don't show toast for 401s on non-protected pages or public routes
    const config = error.config || {};
    const isPublicRoute =
      config.url?.includes('/public/') ||
      config.url?.includes('/admin/content') ||
      config.url?.includes('/admin/policies');

    if (error.response?.status !== 401 || !isPublicRoute) {
      toast.error(message);
    }

    // Handle 401 (Unauthorized) - redirect to login
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAppPath = path.startsWith('/app') || path === '/';

      if (path.startsWith('/admin')) {
        localStorage.removeItem('admin-token');
      } else if (path.startsWith('/vendor')) {
        localStorage.removeItem('vendor-token');
      } else if (path.startsWith('/delivery')) {
        localStorage.removeItem('delivery-token');
      } else {
        localStorage.removeItem('token');
      }

      // Only redirect if NOT a public route or if specifically required
      if (!isPublicRoute && !isAppPath) {
        // ... potentially redirect ...
      }
    }

    return Promise.reject(error);
  }
);

export default api;

