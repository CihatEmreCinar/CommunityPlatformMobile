import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', request);
    await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    await tokenStorage.setUser(data.user);
    return data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', request);
    await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    await tokenStorage.setUser(data.user);
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