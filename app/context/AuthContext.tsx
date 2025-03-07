// /app/context/AuthContext.tsx
'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { account, OAuthProvider, getHostProfileByUserId } from '../lib/appwrite';
import { Models } from 'appwrite';

export interface UserProfile {
  picture?: string;
  // ... add any additional properties as needed
}

// Extend the Appwrite user type to include our hostProfile field.
export interface ExtendedUser extends Models.User<UserProfile> {
  hostProfile?: Models.Document; // if a host profile exists, store it here
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
      // Now fetch host profile using your existing function
      const hostProfile = await getHostProfileByUserId(userData.$id);
      // Extend the userData with hostProfile
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

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<ExtendedUser> => {
    const newUser = await account.create('unique()', email, password, name);
    return newUser as ExtendedUser;
  };

  const signIn = async (email: string, password: string): Promise<Models.Session> => {
    return await account.createSession(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const redirectUrl = window.location.origin + '/context/Callback';
      // Pass the success URL and optionally a failure URL as third parameter.
      await account.createOAuth2Session(OAuthProvider.Google, redirectUrl, redirectUrl);
      // After OAuth, the user is redirected to '/auth/callback', where you can call fetchUser().
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