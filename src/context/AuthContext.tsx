import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import {
  loginWithEmail,
  logout as logoutService,
  registerUser,
  resetPassword as resetPasswordService,
  fetchUserProfile,
  updateUserProfile,
} from '../services/auth.service';
import { registerForPushNotifications } from '../services/notifications.service';
import { UserProfile, UserRole } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extra?: { apartment?: string; block?: string; phone?: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_CACHE_KEY = '@sindico_user_profile';

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser: User) => {
    try {
      // Try cache first for faster startup
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) setUserProfile(JSON.parse(cached));

      // Fetch fresh from Firebase
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        setUserProfile(profile);
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));

        // Register push token
        await registerForPushNotifications(firebaseUser.uid).catch(() => null);
      }
    } catch (e) {
      console.warn('Error loading user profile:', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setUserProfile(null);
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    await loginWithEmail(email, password);
    // onAuthStateChanged handles the rest
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extra?: { apartment?: string; block?: string; phone?: string }
  ) => {
    await registerUser(email, password, name, role, extra);
  };

  const signOut = async () => {
    await logoutService();
    setUserProfile(null);
    await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
  };

  const resetPassword = async (email: string) => {
    await resetPasswordService(email);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.uid);
    if (profile) {
      setUserProfile(profile);
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signIn, signUp, signOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
