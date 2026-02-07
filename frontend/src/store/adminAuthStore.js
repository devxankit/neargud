import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { adminAuthApi } from '../services/adminAuthApi';
import { calcLength } from 'framer-motion';

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          const body = await adminAuthApi.login(email, password);

          console.log("LOGIN RESPONSE:", body);

          // ✅ CORRECT CHECK (based on REAL response)
          // API returns { success: true, data: { admin, token } }
          const authData = body?.data || body;

          if (authData?.token && authData?.admin) {
            set({
              admin: authData.admin,
              token: authData.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            localStorage.setItem("admin-token", authData.token);
            return body;
          }

          throw new Error("Login failed");

        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Login failed";

          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      }
      ,
      // Admin logout action
      logout: async () => {
        // Clear state immediately
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('admin-token');

        try {
          await adminAuthApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      // Initialize admin auth state
      initialize: async () => {
        const token = localStorage.getItem('admin-token');

        if (token) {
          try {
            const response = await adminAuthApi.getMe();
            if (response.success) {
              // Handle potential nesting: response.data.admin or response.admin
              const adminData = response.data?.admin || response.admin || response.data;

              if (adminData) {
                set({
                  admin: adminData,
                  isAuthenticated: true,
                  // Token is already there
                });
              } else {
                // Structure mismatch, treat as invalid
                throw new Error("Invalid admin data structure");
              }
            } else {
              throw new Error("GetMe reported failure");
            }
          } catch (error) {
            console.error("Session restoration failed:", error.message);
            // Session is invalid or network error. 
            // In either case, we can't assume we are logged in.
            // But we should NOT call api.logout() because we likely aren't authenticated or network is down.
            // Just clear local state.
            set({
              admin: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
            localStorage.removeItem('admin-token');
          }
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive or necessary parts if needed? 
      // Actually standard persist is fine as long as we validate on load.
      partialize: (state) => ({ admin: state.admin, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

