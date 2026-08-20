import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (credentials: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous session hydration from localStorage to eliminate startup lag
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farmse_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('farmse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // If already authenticated in localStorage, do not block the UI
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const storedToken = localStorage.getItem('farmse_token');
    const storedUser = localStorage.getItem('farmse_user');
    return !!storedToken && !storedUser;
  });

  const { success, error: toastError } = useToast();

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('farmse_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('farmse_user', JSON.stringify(res.data.data));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('farmse_token');
        localStorage.removeItem('farmse_user');
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only refresh in background if token exists
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const login = async (credentials: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.login(credentials);
      if (res.data.success && res.data.data) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        localStorage.setItem('farmse_token', receivedToken);
        localStorage.setItem('farmse_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        setIsLoading(false);
        success(`Welcome back, ${receivedUser.name}! 🌾`);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.error || 'Invalid credentials';
      toastError(msg);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.register(data);
      if (res.data.success && res.data.data) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        localStorage.setItem('farmse_token', receivedToken);
        localStorage.setItem('farmse_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        setIsLoading(false);
        success(`Account created! Welcome to FarmSe, ${receivedUser.name}!`);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.error || 'Registration failed';
      toastError(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('farmse_token');
    localStorage.removeItem('farmse_user');
    setToken(null);
    setUser(null);
    setIsLoading(false);
    success('Logged out successfully.');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedData };
      setUser(merged);
      localStorage.setItem('farmse_user', JSON.stringify(merged));
    }
  };

  const isFarmer = user?.role === 'FARMER';
  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isFarmer,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
