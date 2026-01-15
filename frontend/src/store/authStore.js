import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      topLevelToken: null, // For backward compatibility if needed properties
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/login', { identifier, password });
          const { user, token } = response.data.data ? response.data.data : response.data;

          set({
            user: user,
            // Store token in state
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API interceptor
          localStorage.setItem('token', token);

          return { success: true, user: user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register action
      register: async (firstName, lastName, email, password, phone) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/register', { firstName, lastName, email, password, phone });

          // Registration initiated, usually requires verification
          // Do NOT set isAuthenticated here unless backend returns token immediately
          // Backend returns { success: true, message: '...', data: { email } }

          set({ isLoading: false });
          return response.data; // Return full response so component can check next steps
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Verify Email (OTP)
      verifyEmail: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/verify-email', { email, otp });
          const { user, token } = response.data.data ? response.data.data : response.data;

          set({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false
          });

          localStorage.setItem('token', token);
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Resend OTP
      resendOTP: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/resend-otp', { email });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
        // Optional: Call logout endpoint
        api.post('/auth/user/logout').catch(console.error);
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/user/profile', profileData);
          const updatedUser = response.data.data?.user || response.data?.user || response.data;

          set({
            user: updatedUser,
            isLoading: false,
          });

          return { success: true, user: updatedUser };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Upload profile image
      uploadProfileImage: async (imageFile) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('profileImage', imageFile);

          const response = await api.put('/auth/user/profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const updatedUser = response.data.data?.user || response.data?.user || response.data;

          set({
            user: updatedUser,
            isLoading: false,
          });

          return { success: true, user: updatedUser };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
          await api.put('/auth/user/change-password', { currentPassword, newPassword });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/forgot-password', { email });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Reset Password
      resetPassword: async (email, otp, newPassword) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/user/reset-password', { email, otp, newPassword });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Get current user (refresh user data)
      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/user/me');
          const user = response.data.data?.user || response.data?.user || response.data;

          set({
            user: user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          // If unauthorized, logout
          if (error.response?.status === 401) {
            get().logout();
          }
          throw error;
        }
      },

      // Initialize auth state from localStorage
      initialize: () => {
        const token = localStorage.getItem('token');
        if (token) {
          const storedState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          if (storedState.state?.user && storedState.state?.token) {
            set({
              user: storedState.state.user,
              token: storedState.state.token,
              isAuthenticated: true,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
