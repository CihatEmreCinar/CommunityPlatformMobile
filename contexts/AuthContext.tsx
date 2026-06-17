import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<User>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
  try {
    const token = await tokenStorage.getAccessToken();
    const storedUser = await tokenStorage.getUser<User>();

    if (!token || !storedUser) {
      setIsLoading(false);
      return;
    }

    // Token expiry kontrolü
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      await tokenStorage.clearAll();
      setIsLoading(false);
      return;
    }

    setUser(storedUser);
  } catch (e) {
    await tokenStorage.clearAll();
  } finally {
    setIsLoading(false);
  }
}

 async function login(request: LoginRequest): Promise<User> {
  const response = await authService.login(request);
  setUser(response.user);
  return response.user;
}

  async function register(request: RegisterRequest) {
    const response = await authService.register(request);
    setUser(response.user);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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