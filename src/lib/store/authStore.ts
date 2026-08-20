import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { authAPI } from "@/lib/api/endpoints";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
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
        const token = getCookie("access_token");
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authAPI.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            loginError: null,
          });
        } catch (error) {
          console.error("Auth initialization failed:", error);
          deleteCookie("access_token");
          deleteCookie("refresh_token");
          deleteCookie("user_role");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (username: string, password: string) => {
        set({ isLoading: true, loginError: null });
        try {
          const response = await authAPI.login({ username, password });
          const { access, refresh, user } = response.data;

          setCookie("access_token", access, {
            maxAge: 60 * 60 * 24,
            path: "/",
            sameSite: "lax",
          });
          setCookie("refresh_token", refresh, {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax",
          });
          setCookie("user_role", user.role, {
            maxAge: 60 * 60 * 24,
            path: "/",
            sameSite: "lax",
          });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginError: null,
          });

          return { success: true };
        } catch (error: any) {
          let errorMessage = "Invalid username or password. Please check your credentials.";
          
          if (error.response?.status === 429) {
            errorMessage = error.response.data?.detail || "Too many failed login attempts. Account temporarily locked for 15 minutes.";
          } else if (error.response?.status === 401 || error.response?.status === 400) {
            if (error.response.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data?.non_field_errors?.[0]) {
              errorMessage = error.response.data.non_field_errors[0];
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          } else if (!error.response) {
            errorMessage = "Unable to connect to StayCraft server. Please verify backend is running.";
          }
          
          set({
            isLoading: false,
            loginError: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          deleteCookie("access_token");
          deleteCookie("refresh_token");
          deleteCookie("user_role");
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            loginError: null,
          });

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Logout error:", error);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, loginError: null });
      },

      checkAuth: async () => {
        const { isAuthenticated, user } = get();
        if (isAuthenticated && user) return true;

        const token = getCookie("access_token");
        if (!token) return false;

        try {
          const response = await authAPI.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            loginError: null,
          });
          return true;
        } catch {
          await get().logout();
          return false;
        }
      },

      clearError: () => {
        set({ loginError: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

