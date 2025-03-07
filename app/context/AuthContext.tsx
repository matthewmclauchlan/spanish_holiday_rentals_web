// /app/context/AuthContext.tsx
'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { account, OAuthProvider, getHostProfileByUserId } from '../lib/appwrite';
import { Models } from 'appwrite';

export interface UserProfile {
  picture?: string;
  // Additional custom properties can be added here
}

export interface ExtendedUser extends Models.User<UserProfile> {
  hostProfile?: Models.Document;
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
      const hostProfile = await getHostProfileByUserId(userData.$id);
      setUser({ ...userData, hostProfile } as ExtendedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<ExtendedUser> => {
    const newUser = await account.create('unique()', email, password, name);
    // Optionally, send new user details to Glide here.
    return newUser as ExtendedUser;
  };

  const signIn = async (email: string, password: string): Promise<Models.Session> => {
    return await account.createEmailPasswordSession(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      // Provide a proper redirect URL – make sure this URL is registered in your Appwrite console.
      const redirectUrl = window.location.origin + '/auth/callback';
      await account.createOAuth2Session(OAuthProvider.Google, redirectUrl, redirectUrl);
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
