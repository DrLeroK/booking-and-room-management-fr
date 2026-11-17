import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from '@/lib/security';
import { User, LoginCredentials } from '@/types';
import { ApiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (
    credentialsOrUsername: string | LoginCredentials | { username: string; password: string },
    maybePassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      loginError: null,

      initializeAuth: async () => {
        const token = safeStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const user = await ApiClient.get<User>('/users/me/');
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginError: null,
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          ApiClient.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (credentialsOrUsername, maybePassword) => {
        set({ isLoading: true, loginError: null });
        const credentials =
          typeof credentialsOrUsername === 'string'
            ? { username: credentialsOrUsername, password: maybePassword || '' }
            : credentialsOrUsername;

        try {
          const response = await ApiClient.post<any>('/users/login/', credentials);
          const { access, refresh, user } = response;

          ApiClient.setTokens(access, refresh);
          safeStorage.setItem('user_role', user.role);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginError: null,
          });

          return { success: true };
        } catch (error: any) {
          let errorMessage = 'Invalid username or password. Please check your credentials.';

          if (error.response?.status === 429) {
            errorMessage =
              error.response.data?.detail ||
              'Too many failed login attempts. Account temporarily locked for 15 minutes.';
          } else if (error.response?.status === 401 || error.response?.status === 400) {
            if (error.response.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data?.non_field_errors?.[0]) {
              errorMessage = error.response.data.non_field_errors[0];
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          } else if (!error.response) {
            errorMessage = 'Unable to connect to StayCraft server. Please verify backend is running.';
          }

          set({
            loginError: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });

          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        const refreshToken = ApiClient.getRefreshToken();
        if (refreshToken) {
          try {
            await ApiClient.post('/users/logout/', { refresh: refreshToken });
          } catch (err) {
            console.warn('Backend token invalidation completed or skipped:', err);
          }
        }
        ApiClient.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          loginError: null,
        });
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      checkAuth: async () => {
        const token = safeStorage.getItem('access_token');
        if (!token) {
          get().logout();
          return false;
        }

        try {
          const user = await ApiClient.get<User>('/users/me/');
          set({
            user,
            isAuthenticated: true,
          });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      clearError: () => set({ loginError: null }),
    }),
    {
      name: 'staycraft_auth_storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
