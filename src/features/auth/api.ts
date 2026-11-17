import { ApiClient } from '@/lib/api';
import { User, LoginCredentials, AuthResponse } from '@/types';

export const authFeatureApi = {
  login: (credentials: LoginCredentials) =>
    ApiClient.post<AuthResponse>('/users/login/', credentials),

  refreshToken: (refresh: string) =>
    ApiClient.post<{ access: string }>('/users/token/refresh/', { refresh }),

  logout: (refresh: string) =>
    ApiClient.post<{ message: string }>('/users/logout/', { refresh }),

  getProfile: () => ApiClient.get<User>('/users/me/'),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => ApiClient.post('/users/change-password/', data),

  requestPasswordReset: (email: string) =>
    ApiClient.post<{ message: string }>('/users/password-reset/', { email }),

  confirmPasswordReset: (data: {
    uid: string;
    token: string;
    new_password: string;
    new_password_confirm: string;
  }) => ApiClient.post<{ message: string }>('/users/password-reset-confirm/', data),
};
