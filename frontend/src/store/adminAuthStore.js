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
            console.log('[AdminAuth] Setting token in state and localStorage:', authData.token.substring(0, 20) + '...');

            set({
              admin: authData.admin,
              token: authData.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            localStorage.setItem("admin-token", authData.token);
            console.log('[AdminAuth] Token stored. Verifying:', localStorage.getItem('admin-token') ? 'SUCCESS' : 'FAILED');
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
        set({ isLoading: true });

        // First check if we have token in current state (from Zustand persist)
        const currentState = get();
        let token = currentState.token;

        // If not in state, check localStorage as fallback
        if (!token) {
          token = localStorage.getItem('admin-token');
        }

        console.log('[AdminAuth] Initialize called. Token exists:', !!token);

        if (token) {
          try {
            // Ensure token is synced to localStorage for API interceptor
            localStorage.setItem('admin-token', token);

            // If we don't have admin data, verify the session
            if (!currentState.admin) {
              console.log('[AdminAuth] Verifying session with /auth/admin/me...');
              const response = await adminAuthApi.getMe();
              console.log('[AdminAuth] GetMe response:', response);

              if (response.success) {
                // Handle potential nesting: response.data.admin or response.admin or response.data
                const adminData = response.data?.admin || response.admin || response.data;

                if (adminData) {
                  console.log('[AdminAuth] Session restored successfully for:', adminData.email);
                  set({
                    admin: adminData,
                    token: token,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                } else {
                  // Structure mismatch, treat as invalid
                  throw new Error("Invalid admin data structure");
                }
              } else {
                throw new Error("GetMe reported failure");
              }
            } else {
              // We have both token and admin data from persisted state
              console.log('[AdminAuth] Session loaded from persisted state for:', currentState.admin.email);
              set({
                admin: currentState.admin,
                token: token,
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } catch (error) {
            console.error("[AdminAuth] Session restoration failed:", error.message, error);
            // Session is invalid or network error. 
            // In either case, we can't assume we are logged in.
            // But we should NOT call api.logout() because we likely aren't authenticated or network is down.
            // Just clear local state.
            console.log('[AdminAuth] Clearing admin session');
            set({
              admin: null,
              token: null,
              isAuthenticated: false,
              error: null,
              isLoading: false,
            });
            localStorage.removeItem('admin-token');
          }
        } else {
          // No token found, ensure clean state
          set({
            admin: null,
            token: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
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

