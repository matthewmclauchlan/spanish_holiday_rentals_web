// /app/context/AuthContext.tsx
'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { account, OAuthProvider } from '../lib/appwrite';
import { Models } from 'appwrite';

// Define a profile interface that includes a picture.
export interface UserProfile {
  picture?: string;
  // You can add other custom properties here if needed.
}

// Extend the Appwrite User type to include our custom properties.
export interface ExtendedUser extends Models.User<UserProfile> {
  picture?: string;
}

interface AuthContextProps {
  user: ExtendedUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<ExtendedUser>;
  signIn: (email: string, password: string) => Promise<Models.Session>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async (): Promise<void> => {
    try {
      const userData = await account.get();
      // Here we cast to ExtendedUser so that our custom properties are allowed.
      setUser(userData as ExtendedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<ExtendedUser> => {
    return await account.create('unique()', email, password, name) as ExtendedUser;
  };

  const signIn = async (email: string, password: string): Promise<Models.Session> => {
    return await account.createSession(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await account.createOAuth2Session(OAuthProvider.Google, window.location.origin);
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
