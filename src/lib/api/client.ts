import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor - adds token to requests, omitting it for public reads to avoid expired token 401s
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const isProtectedContent = config.url?.includes("/content/contact-inquiry/");
      const isPublicRead =
        config.method?.toLowerCase() === "get" &&
        !isProtectedContent &&
        (config.url?.includes("/content/") ||
          config.url?.includes("/rooms/types/") ||
          config.url?.includes("/rooms/amenities/"));

      const token = getCookie("access_token");
      if (token && !isPublicRead) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. It's not the login request itself
    // 3. It's not already retried
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login/')
    ) {
      originalRequest._retry = true;

      // If it's a public GET endpoint, retry once cleanly without the stale Authorization header
      if (originalRequest.method?.toLowerCase() === "get" && originalRequest.url?.includes("/content/")) {
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return apiClient(originalRequest);
      }

      try {
        const refreshToken = getCookie("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setCookie("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        deleteCookie("user_role");
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isDashboardRoute =
            currentPath.startsWith("/reception") ||
            currentPath.startsWith("/manager") ||
            currentPath.startsWith("/owner") ||
            currentPath.startsWith("/housekeeping");
          if (isDashboardRoute) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
