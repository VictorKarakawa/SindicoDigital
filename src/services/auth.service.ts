import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  getAuth,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { auth, database, firebaseConfig } from '../config/firebase';
import { UserProfile, UserRole, ResidentType } from '../types';

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: UserRole,
  extra?: {
    apartmentId?: string;
    apartment?: string;
    block?: string;
    phone?: string;
    cpf?: string;
    rg?: string;
    birthDate?: string;
    residentType?: ResidentType;
    photoURL?: string;
    status?: UserStatus;
  }
): Promise<User> => {
  // Use a secondary Firebase app to prevent logging out the current user (e.g. the Syndic)
  let secondaryApp;
  try {
    secondaryApp = getApp('SecondaryApp');
  } catch (e) {
    secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
  }
  const secondaryAuth = getAuth(secondaryApp);

  const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName: name });
  await signOut(secondaryAuth); // Sign out the secondary app immediately

  const profile: UserProfile = {
    uid: user.uid,
    name,
    email,
    role,
    cpf: extra?.cpf ?? '',
    rg: extra?.rg ?? '',
    birthDate: extra?.birthDate ?? '',
    apartment: extra?.apartment ?? '',
    block: extra?.block ?? '',
    phone: extra?.phone ?? '',
    photoURL: extra?.photoURL ?? '',
    status: extra?.status ?? 'active',
    createdAt: Date.now(),
  };

  if (extra?.residentType !== undefined) {
    profile.residentType = extra.residentType;
  }
  if (extra?.apartmentId !== undefined) {
    profile.apartmentId = extra.apartmentId;
  }

  await set(ref(database, `users/${user.uid}`), profile);
  return user;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// ─── Password Reset ───────────────────────────────────────────────────────────
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// ─── Fetch User Profile ───────────────────────────────────────────────────────
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await get(ref(database, `users/${uid}`));
  if (!snap.exists()) return null;
  return snap.val() as UserProfile;
};

// ─── Update User Profile ──────────────────────────────────────────────────────
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  await update(ref(database, `users/${uid}`), data);
};
