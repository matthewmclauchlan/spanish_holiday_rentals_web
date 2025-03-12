'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { account, OAuthProvider, getHostProfileByUserId, storage } from '../lib/appwrite';
import { Models, ID } from 'appwrite';

export interface UserProfile {
  picture?: string;
  avatarUrl?: string; // This field will hold the avatar URL in user preferences
}

export interface ExtendedUser extends Models.User<UserProfile> {
  avatarUrl?: string;
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
  updateAvatar: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async (): Promise<void> => {
    try {
      const userData = await account.get();
      // Extract avatarUrl from the user's preferences (if available)
      const avatarUrl = (userData as { prefs?: { avatarUrl?: string } }).prefs?.avatarUrl || '';
      const hostProfile = await getHostProfileByUserId(userData.$id);
      const updatedUser = {
        ...userData,
        hostProfile: hostProfile || undefined,
        avatarUrl,
      };
      setUser(updatedUser as ExtendedUser);
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
    return newUser as ExtendedUser;
  };

  const signIn = async (email: string, password: string): Promise<Models.Session> => {
    return await account.createEmailPasswordSession(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
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

  const updateAvatar = async (file: File): Promise<void> => {
    try {
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID!;
      // Omit read/write arrays so that default bucket permissions are applied.
      const fileUploaded = await storage.createFile(
        bucketId,
        ID.unique(),
        file
      );
      const fileUrl = fileUploaded.$id;
      // Update the user's preferences with the new avatar URL.
      await account.updatePrefs({ avatarUrl: fileUrl });
      setUser((prevUser) => (prevUser ? { ...prevUser, avatarUrl: fileUrl } : prevUser));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, fetchUser, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
