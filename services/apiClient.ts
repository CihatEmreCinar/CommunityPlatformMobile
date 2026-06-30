import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { AuthResponse } from '../types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL; // örn: http://192.168.1.x:5000

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,  // ← buraya taşı
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: her isteğe access token ekle ───────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: 401 → token refresh ───────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Başka istek zaten refresh yapıyorsa, sıraya al
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // ✅ Düzeltme: /api/v1 prefix eklendi
        const { data } = await axios.post<AuthResponse>(
          `${API_URL}/api/v1/auth/refresh`,
          { refreshToken }
        );

        await tokenStorage.setTokens(data.accessToken, data.refreshToken);

        // Kuyruktaki istekleri yeni token ile çöz
        refreshQueue.forEach((cb) => cb(data.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshQueue = [];
        await tokenStorage.clearAll();
        // Uygulamayı login'e yönlendir — bu kısmı kendi navigation yapına göre handle et
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);