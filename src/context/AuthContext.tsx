import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { socketService } from '@/lib/socket';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: string | null;
  token: string | null;
  updateUser?: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify token is still valid by fetching current user
          try {
            const { data } = await apiClient.get('/auth/me');
            setUser(data.data);
            localStorage.setItem('user', JSON.stringify(data.data));

            // Reconnect socket service on app reload
            if (data.data.restaurantId) {
              socketService.connect(storedToken, data.data.restaurantId);
            }
          } catch (error) {
            // Token invalid, clear everything
            console.error('Token validation failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        setUser(JSON.parse(e.newValue));
      } else if (e.key === 'user' && !e.newValue) {
        setUser(null);
      }

      if (e.key === 'auth_token') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user: userData, token: authToken } = data.data;

      // Store auth data
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store restaurant_id for API header (critical for tenant context)
      if (userData.restaurantId) {
        localStorage.setItem('restaurant_id', userData.restaurantId);
      }
      
      setToken(authToken);
      setUser(userData);

      // Connect socket service with token and restaurantId
      if (userData.restaurantId) {
        socketService.connect(authToken, userData.restaurantId);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(
        error.response?.data?.error || 'Login failed. Please check your credentials.'
      );
    }
  }, []);

  const logout = useCallback(() => {
    // Disconnect socket service
    socketService.disconnect();

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Clear state
    setToken(null);
    setUser(null);

    // Optionally call logout endpoint
    apiClient.post('/auth/logout').catch(() => {
      // Ignore errors on logout
    });
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isLoading,
    restaurantId: user?.restaurantId || null,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
