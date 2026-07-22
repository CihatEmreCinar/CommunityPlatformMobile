import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import { ApiMessageResponse, AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from '../types/auth';

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', request);
    await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    await tokenStorage.setUser(data.user);
    return data;
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', request);
    return data;
  },

  async verifyEmail(email: string, code: string): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/auth/verify-email', { email, code });
    return data;
  },

  async resendVerification(email: string): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/auth/resend-verification', { email });
    return data;
  },

  async requestPasswordReset(email: string): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/auth/reset-password', { token, newPassword });
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // sessizce devam et, lokal temizliği yap
      }
    }
    await tokenStorage.clearAll();
  },
};
