import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { AuthResponse } from '../types/auth';
import { API_BASE_URL } from './apiConfig';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

function requestUrl(config: InternalAxiosRequestConfig): string {
  return new URL(config.url ?? '', config.baseURL).toString();
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    console.info('[api] request', config.method?.toUpperCase(), requestUrl(config));
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (__DEV__ && originalRequest) {
      console.warn('[api] response error', {
        method: originalRequest.method?.toUpperCase(),
        url: requestUrl(originalRequest),
        status: error.response?.status,
        message: error.message,
      });
    }

    const isAuthenticationRequest = originalRequest?.url?.startsWith('/auth/');
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthenticationRequest) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 10000 }
      );

      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
      refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError));
      refreshQueue = [];
      await tokenStorage.clearAll();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
