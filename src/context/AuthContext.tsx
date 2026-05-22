import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
    extra?: { apartment?: string; block?: string; phone?: string; apartmentId?: string; cpf?: string; rg?: string }
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
  const isRegistering = useRef(false);

  const loadProfile = useCallback(async (firebaseUser: User) => {
    try {
      // Try cache first for faster startup
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.status === 'inactive') {
          await logoutService();
          setUserProfile(null);
          await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
          return;
        }
        setUserProfile(parsed);
      }

      // Fetch fresh from Firebase
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile || profile.status === 'inactive') {
        // During registration, profile may not exist yet — don't log out
        if (isRegistering.current) return;
        await logoutService();
        setUserProfile(null);
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
        return;
      }

      setUserProfile(profile);
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));

      // Register push token
      await registerForPushNotifications(firebaseUser.uid).catch(() => null);
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
    const firebaseUser = await loginWithEmail(email, password);
    const profile = await fetchUserProfile(firebaseUser.uid);
    if (!profile) {
      await logoutService();
      throw { code: 'auth/user-not-found', message: 'Usuário não cadastrado ou removido do sistema.' };
    }
    if (profile.status === 'inactive') {
      await logoutService();
      throw { code: 'auth/user-disabled', message: 'Sua conta foi desativada pela administração.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extra?: { apartment?: string; block?: string; phone?: string; apartmentId?: string; cpf?: string; rg?: string }
  ) => {
    // Use a ref flag to prevent onAuthStateChanged from logging out before the profile is saved
    isRegistering.current = true;
    try {
      await registerUser(email, password, name, role, extra);
      // Now sign in the new user on the primary auth so they are authenticated
      const firebaseUser = await loginWithEmail(email, password);
      // Load the profile (it should exist now)
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        setUserProfile(profile);
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      }
    } finally {
      isRegistering.current = false;
    }
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
