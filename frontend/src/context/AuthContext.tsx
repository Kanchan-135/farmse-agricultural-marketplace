import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farmse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: toastError } = useToast();

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('farmse_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('farmse_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('farmse_token');
      localStorage.removeItem('farmse_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

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
        success(`Welcome back, ${receivedUser.name}! 🌾`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      toastError(msg);
      return false;
    } finally {
      setIsLoading(false);
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
        success(`Account created! Welcome to FarmSe, ${receivedUser.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      toastError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('farmse_token');
    localStorage.removeItem('farmse_user');
    setToken(null);
    setUser(null);
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
