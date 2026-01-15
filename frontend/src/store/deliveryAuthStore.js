import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../utils/api';

export const useDeliveryAuthStore = create(
  persist(
    (set, get) => ({
      deliveryBoy: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Delivery boy login action
      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/delivery/login', { identifier, password });
          const { deliveryBoy, token } = response.data;

          set({
            deliveryBoy,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API interceptor
          localStorage.setItem('delivery-token', token);

          return { success: true, deliveryBoy };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Delivery boy register action
      register: async (partnerData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/delivery/register', partnerData);
          set({ isLoading: false });
          return response; // Return full response to get email for verification
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Verify email action
      verifyEmail: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/delivery/verify-email', { email, otp });
          const { deliveryBoy, token } = response.data;

          set({
            deliveryBoy,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('delivery-token', token);
          return { success: true, deliveryBoy };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Resend OTP action
      resendOTP: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/delivery/resend-otp', { email });
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Delivery boy logout action
      logout: () => {
        set({
          deliveryBoy: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('delivery-token');
        localStorage.removeItem('delivery-auth-storage');
      },

      // Update delivery boy status
      updateStatus: (status) => {
        const current = get();
        if (current.deliveryBoy) {
          set({
            deliveryBoy: {
              ...current.deliveryBoy,
              status: status,
            },
          });
        }
      },

      // Initialize delivery auth state from localStorage
      initialize: async () => {
        const token = localStorage.getItem('delivery-token');
        if (token) {
          try {
            // Optional: verify token by fetching profile
            const response = await api.get('/auth/delivery/me');
            if (response.success && response.data) {
              set({
                deliveryBoy: response.data,
                token: token,
                isAuthenticated: true,
              });
            } else {
              throw new Error('Verification failed');
            }
          } catch (error) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'delivery-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

