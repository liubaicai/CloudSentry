import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { setupService } from '../services/setupService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First, check if the system has been initialized
        const setupStatus = await setupService.getStatus();
        setInitialized(setupStatus.initialized);

        // If system is initialized and user has a token, fetch user data
        if (setupStatus.initialized && authService.isAuthenticated()) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch {
            authService.logout();
          }
        }
      } catch {
        // If we can't check setup status, assume initialized
        setInitialized(true);
        if (authService.isAuthenticated()) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch {
            authService.logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    setUser(response.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authService.register({ username, email, password });
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setInitialized(true);
      } catch {
        authService.logout();
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
