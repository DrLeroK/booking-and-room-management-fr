import { safeStorage, isValidJwt, isJwtExpired } from '@/lib/security';
import { siteConfig } from '@/config/site';

export function getApiBaseUrl(): string {
  const envUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACK_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  return siteConfig.apiUrl || 'http://localhost:8000/api/v1';
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  results?: T extends any[] ? T : any[];
  count?: number;
  [key: string]: any;
}

export class ApiClient {
  public baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  // ==========================================
  // Token Management
  // ==========================================

  public static getAccessToken(): string | null {
    const token = safeStorage.getItem('access_token');
    return isValidJwt(token) ? token : null;
  }

  public static getRefreshToken(): string | null {
    const token = safeStorage.getItem('refresh_token');
    return isValidJwt(token) ? token : null;
  }

  public static setTokens(accessToken: string, refreshToken?: string) {
    if (isValidJwt(accessToken)) {
      safeStorage.setItem('access_token', accessToken);
    }
    if (refreshToken && isValidJwt(refreshToken)) {
      safeStorage.setItem('refresh_token', refreshToken);
    }
  }

  public static clearTokens() {
    safeStorage.removeItem('access_token');
    safeStorage.removeItem('refresh_token');
    safeStorage.removeItem('user_role');
  }

  public static async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        this.setTokens(data.access);
        return true;
      }
    } catch (e) {
      console.error('Failed to refresh token', e);
    }

    this.clearTokens();
    return false;
  }

  // ==========================================
  // Core Request Engine
  // ==========================================

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = ApiClient.getAccessToken();

    // Proactive JWT Expiration Guard: refresh before sending if expired or near expiry
    if (token && isJwtExpired(token)) {
      const refreshed = await ApiClient.refreshAccessToken();
      if (refreshed) {
        token = ApiClient.getAccessToken();
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Reactive Token Refresh on 401
    if (response.status === 401 && !endpoint.includes('/login/') && !endpoint.includes('/refresh/')) {
      const refreshed = await ApiClient.refreshAccessToken();
      if (refreshed) {
        token = ApiClient.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      const error: any = new Error(errorData.detail || errorData.message || 'API request failed');
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    // Return JSON or empty if 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==========================================
  // HTTP Methods (Instance & Static)
  // ==========================================

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let finalUrl = endpoint;
    if (params) {
      const filteredParams = Object.entries(params).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ''
      );
      if (filteredParams.length > 0) {
        const searchParams = new URLSearchParams();
        filteredParams.forEach(([k, v]) => searchParams.append(k, String(v)));
        finalUrl += `${finalUrl.includes('?') ? '&' : '?'}${searchParams.toString()}`;
      }
    }
    return this.request<T>(finalUrl, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Static conveniences
  static instance = new ApiClient();
  static get<T = any>(endpoint: string, params?: Record<string, any>) {
    return this.instance.get<T>(endpoint, params);
  }
  static post<T = any>(endpoint: string, data?: any) {
    return this.instance.post<T>(endpoint, data);
  }
  static patch<T = any>(endpoint: string, data?: any) {
    return this.instance.patch<T>(endpoint, data);
  }
  static put<T = any>(endpoint: string, data?: any) {
    return this.instance.put<T>(endpoint, data);
  }
  static delete<T = any>(endpoint: string) {
    return this.instance.delete<T>(endpoint);
  }
}

export const api = ApiClient.instance;
