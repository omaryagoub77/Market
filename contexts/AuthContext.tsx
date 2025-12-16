import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import expoNotificationService from '@/src/expoNotificationService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setRedirectUrl: (url: string | null) => void;
  getRedirectUrl: () => string | null;
  clearRedirectUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrlState] = useState<string | null>(null);

  // Set redirect URL
  const setRedirectUrl = (url: string | null) => {
    setRedirectUrlState(url);
    if (url) {
      try {
        localStorage.setItem('redirectUrl', url);
      } catch (e) {
        console.warn('Could not save redirect URL to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem('redirectUrl');
      } catch (e) {
        console.warn('Could not remove redirect URL from localStorage:', e);
      }
    }
  };

  // Get redirect URL
  const getRedirectUrl = () => {
    if (redirectUrl) return redirectUrl;
    try {
      return localStorage.getItem('redirectUrl');
    } catch (e) {
      console.warn('Could not get redirect URL from localStorage:', e);
      return null;
    }
  };

  // Clear redirect URL
  const clearRedirectUrl = () => {
    setRedirectUrlState(null);
    try {
      localStorage.removeItem('redirectUrl');
    } catch (e) {
      console.warn('Could not remove redirect URL from localStorage:', e);
    }
  };

  // Initialize notifications when user logs in
  useEffect(() => {
    const initializeNotifications = async () => {
      if (user) {
        try {
          // Initialize notification service
          await expoNotificationService.init();
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    initializeNotifications();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setRedirectUrl, getRedirectUrl, clearRedirectUrl }}>
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