'use client';
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { account, OAuthProvider, getHostProfileByUserId } from '../lib/appwrite';
import { Models } from 'appwrite';
import { sendNewUserToGlide } from '../lib/sendUserToGlide';

export interface UserProfile {
  picture?: string;
  // ... add any additional properties as needed
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

  /**
   * Fetches the currently authenticated user.
   * For new users, this will trigger the sending of user data to Glide.
   */
  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await account.get();
      const hostProfile = await getHostProfileByUserId(userData.$id);
      const extendedUser = { ...userData, hostProfile } as ExtendedUser;
      setUser(extendedUser);
      // For new users, send user data to Glide.
      // (Use your own logic here to ensure this is only done once per user.)
      const userDataForGlide = {
        userId: userData.$id,
        full_name: userData.name,
        email: userData.email,
        signup_date: new Date().toISOString(),
        auth_method: 'email' // Adjust if needed based on auth method.
      };
      // Call the helper that sends new user data to Glide.
      await sendNewUserToGlide(userDataForGlide);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<ExtendedUser> => {
    const newUser = await account.create('unique()', email, password, name);
    // Build the user data for Glide.
    const userDataForGlide = {
      userId: newUser.$id,
      full_name: name,
      email,
      signup_date: new Date().toISOString(),
      auth_method: 'email'
    };

    try {
      await sendNewUserToGlide(userDataForGlide);
    } catch (error) {
      console.error('Error during signUp sending user to Glide:', error);
      // Continue with sign-up flow even if Glide fails.
    }
    return newUser as ExtendedUser;
  };

  const signIn = async (email: string, password: string): Promise<Models.Session> => {
    return await account.createSession(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await account.createOAuth2Session(OAuthProvider.Google, window.location.origin);
      // After OAuth, the user is redirected and fetchUser will run.
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
