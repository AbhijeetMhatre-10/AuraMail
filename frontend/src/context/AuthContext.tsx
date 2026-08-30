import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api/auth.api';
import { UserProfile, ConnectedAccountInfo } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  account: ConnectedAccountInfo | null;
  isDemo: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<ConnectedAccountInfo | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getMe();
      if (data && data.user) {
        setUser(data.user);
        setAccount(data.account);
        setIsDemo(Boolean(data.isDemo));
      } else {
        setUser(null);
        setAccount(null);
        setIsDemo(false);
      }
    } catch (err) {
      setUser(null);
      setAccount(null);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const url = await authApi.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      console.error('Failed to start Google OAuth:', err);
      throw err;
    }
  };

  const loginWithDemo = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.demoLogin();
      setUser(data.user);
      setIsDemo(true);
      setAccount({
        email: data.user.email,
        provider: 'google',
        isConnected: true,
        syncStatus: 'idle',
        isDemo: true,
      });
    } catch (err) {
      console.error('Failed to login with demo account:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setAccount(null);
      setIsDemo(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        isDemo,
        isLoading,
        loginWithGoogle,
        loginWithDemo,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
