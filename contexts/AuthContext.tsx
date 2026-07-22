import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { User, LoginRequest, RegisterRequest, RegisterResponse } from '../types/auth';
import { apiClient } from '../services/apiClient';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<User>;
  register: (request: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwtExpiry(token: string): number | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(padded))
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function syncCurrentUser(fallbackUser?: User | null): Promise<User | null> {
    try {
      const currentUser = await userService.getMe();
      await tokenStorage.setUser(currentUser);
      setUser(currentUser);
      return currentUser;
    } catch {
      if (fallbackUser) {
        setUser(fallbackUser);
        return fallbackUser;
      }
      return null;
    }
  }

  async function loadStoredUser() {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const storedUser = await tokenStorage.getUser<User>();

      if (!accessToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      const exp = parseJwtExpiry(accessToken);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = exp !== null && exp < now;

      if (!isExpired) {
        await syncCurrentUser(storedUser);
        setIsLoading(false);
        return;
      }

      // Token süresi dolmuş, refresh dene
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        await tokenStorage.clearAll();
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh, user: freshUser } = response.data;
        await tokenStorage.setTokens(newAccess, newRefresh);
        await syncCurrentUser(freshUser);
      } catch {
        // Refresh de başarısız, kullanıcıyı logout yap
        await tokenStorage.clearAll();
      }
    } catch {
      await tokenStorage.clearAll();
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    await syncCurrentUser(user);
  }

  async function login(request: LoginRequest): Promise<User> {
    const response = await authService.login(request);
    const currentUser = await syncCurrentUser(response.user);
    return currentUser ?? response.user;
  }

  async function register(request: RegisterRequest): Promise<RegisterResponse> {
    return authService.register(request);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
