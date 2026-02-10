import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../../../utils/api';

export const useVendorAuthStore = create(
  persist(
    (set, get) => ({
      vendor: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      registrationDraft: null,

      setRegistrationDraft: (data) => set({ registrationDraft: { ...get().registrationDraft, ...data } }),
      clearRegistrationDraft: () => set({ registrationDraft: null }),

      // Vendor login action
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/vendor/login', { email, password });

          const { vendor, token } = response.data;
          const normalizedVendor = { ...vendor, id: vendor._id || vendor.id };

          set({
            vendor: normalizedVendor,
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API interceptor
          localStorage.setItem('vendor-token', token);

          return { success: true, vendor: vendor };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Vendor registration action
      register: async (vendorData) => {
        set({ isLoading: true });
        try {
          const config = vendorData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
          const response = await api.post('/auth/vendor/register', vendorData, config);

          // Response might differ based on whether immediate login is allowed or email verify needed
          // Based on Controller: { success: true, message: '...', data: { ... } }

          set({ isLoading: false });

          return response; // Let component handle success message/redirect
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Vendor logout action
      logout: async () => {
        // Clear state immediately for better UI response
        set({
          vendor: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('vendor-token');

        try {
          // Attempt server-side logout in the background
          await api.post('/auth/vendor/logout');
        } catch (err) {
          console.error("Logout error", err);
        }
      },

      // Update vendor profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/vendor/profile', profileData);

          const updatedVendor = response.data.vendor;
          const normalizedVendor = { ...updatedVendor, id: updatedVendor._id || updatedVendor.id };

          set({
            vendor: normalizedVendor,
            isLoading: false,
          });

          return { success: true, vendor: updatedVendor };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Verify Email
      verifyEmail: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/vendor/verify-email', data);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Resend OTP
      resendOTP: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/vendor/resend-otp', { email });
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/vendor/forgot-password', { email });
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Reset Password
      resetPassword: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/vendor/reset-password', data);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Initialize vendor auth state from localStorage
      initialize: async () => {
        const token = localStorage.getItem('vendor-token');
        if (token) {
          // Identify if we are actually allowed to use this token (maybe check expiry or fetch 'me')
          try {
            // Optionally verify token by fetching profile
            const response = await api.get('/auth/vendor/me');
            if (response.success) {
              const vendorData = response.data.vendor;
              const normalizedVendor = { ...vendorData, id: vendorData._id || vendorData.id };
              set({
                vendor: normalizedVendor,
                token: token,
                isAuthenticated: true
              });
            } else {
              throw new Error("Validation failed");
            }
          } catch (err) {
            // Token invalid
            get().logout();
          }
        }
      },
    }),
    {
      name: 'vendor-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vendor: state.vendor,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        registrationDraft: state.registrationDraft
      }), // Only persist these fields
    }
  )
);
