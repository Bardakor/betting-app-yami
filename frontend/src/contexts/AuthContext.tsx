'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setTokenAndRefresh: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't require authentication
  const publicPaths = ['/login', '/auth/callback'];

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // Redirect logic based on authentication state
    if (!isLoading) {
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!user && !isPublicPath) {
        // User not authenticated and trying to access protected route
        router.push('/login');
      } else if (user && pathname === '/login') {
        // User authenticated but on login page
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already authenticated
      const currentUser = authService.getUser();
      const token = authService.getToken();
      
      if (token && currentUser) {
        setUser(currentUser);
        // Refresh user data to ensure it's up to date
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> => {
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      await authService.refreshUserData();
      const updatedUser = authService.getUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
    }
  };

  const setTokenAndRefresh = async (token: string) => {
    try {
      await authService.setTokenAndFetchUser(token);
      const user = authService.getUser();
      setUser(user);
    } catch (error) {
      console.error('Token processing error:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    setTokenAndRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
} 