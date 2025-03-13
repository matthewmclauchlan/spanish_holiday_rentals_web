'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { account, OAuthProvider, getHostProfileByUserId, storage, teams, ID } from '../lib/appwrite';
import { Models } from 'appwrite';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  picture?: string;
  avatarUrl?: string; // This field will hold the avatar URL in user preferences
}

// Extend the Appwrite user type to include our custom roles
export interface ExtendedUser extends Models.User<UserProfile> {
  avatarUrl?: string;
  hostProfile?: Models.Document;
  roles: string[]; // For example: ['guest'] or ['support']
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
  const router = useRouter();

  const fetchUser = async (): Promise<void> => {
    try {
      const userData = await account.get();
      // Extract avatarUrl from user preferences (if available)
      const avatarUrl = (userData as { prefs?: { avatarUrl?: string } }).prefs?.avatarUrl || '';
      const hostProfile = await getHostProfileByUserId(userData.$id);

      // Determine roles: check if the user belongs to the support team
      const supportTeamId = process.env.NEXT_PUBLIC_APPWRITE_SUPPORT_TEAM_ID;
      let roles: string[] = [];
      if (supportTeamId) {
        try {
          // Get memberships for the support team
          const membershipsResponse = await teams.listMemberships(supportTeamId) as { memberships: { userId: string; roles: string[] }[] };
          const isSupport = membershipsResponse.memberships.some(
            (membership) =>
              membership.userId === userData.$id && membership.roles.includes('support')
          );
          roles = isSupport ? ['support'] : ['guest'];
        } catch (err: unknown) {
          console.error('Error checking support team memberships:', err);
          roles = ['guest'];
        }
      } else {
        roles = ['guest'];
      }

      // Log retrieved user ID and roles for debugging.
      console.log(`Retrieved user: ${userData.$id}, Roles: ${roles.join(', ')}`);

      const updatedUser: ExtendedUser = {
        ...userData,
        hostProfile: hostProfile || undefined,
        avatarUrl,
        roles,
      };

      setUser(updatedUser);
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
    try {
      // If there is an active session, delete it first.
      await account.deleteSession('current');
    } catch (e) {
      console.warn('No active session to delete:', e);
    }
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
      router.push("/"); // Redirect to home page after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateAvatar = async (file: File): Promise<void> => {
    try {
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID!;
      const fileUploaded = await storage.createFile(bucketId, ID.unique(), file);
      const fileUrl = fileUploaded.$id;
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
