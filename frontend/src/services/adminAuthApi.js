import api from '../utils/api';

export const adminAuthApi = {
  // Admin Login
  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password, secretCode: 'admin123' });
    console.log("res", response)
    return response; 
  },

  // Admin Logout
  logout: async () => {
    const response = await api.post('/auth/admin/logout');
    return response;
  },

  // Get Current Admin
  getMe: async () => {
    const response = await api.get('/auth/admin/me');
    return response;
  },
};
