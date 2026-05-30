import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { UserProfile, UserRole } from '../types';

// ─── List users by role ───────────────────────────────────────────────────────
export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return [];
  const all: UserProfile[] = Object.values(snap.val());
  return all.filter((u) => u.role === role);
};

// ─── Get single user ──────────────────────────────────────────────────────────
export const getUserById = async (uid: string): Promise<UserProfile | null> => {
  const snap = await get(ref(database, `users/${uid}`));
  return snap.exists() ? (snap.val() as UserProfile) : null;
};

// ─── Create user entry (used after Firebase Auth) ────────────────────────────
export const createUserEntry = async (profile: UserProfile): Promise<void> => {
  await set(ref(database, `users/${profile.uid}`), profile);
};

// ─── Update user ──────────────────────────────────────────────────────────────
export const updateUser = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  await update(ref(database, `users/${uid}`), data);
};

// ─── Delete user entry (DB only — Auth deletion requires Admin SDK) ───────────
export const deleteUserEntry = async (uid: string): Promise<void> => {
  await remove(ref(database, `users/${uid}`));
};

// ─── Subscribe to users by role ───────────────────────────────────────────────
export const subscribeToUsersByRole = (
  role: UserRole,
  callback: (users: UserProfile[]) => void
) => {
  const dbRef = ref(database, 'users');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const all: UserProfile[] = Object.values(snap.val());
    callback(all.filter((u) => u.role === role));
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

// ─── Check if CPF is already taken ───────────────────────────────────────────
export const isUserCPFTaken = async (cpf: string, excludeUid?: string): Promise<boolean> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return false;
  const all: UserProfile[] = Object.values(snap.val());
  return all.some((u) => u.cpf === cpf && u.uid !== excludeUid);
};

// ─── Check if email is already taken ─────────────────────────────────────────
export const isUserEmailTaken = async (email: string, excludeUid?: string): Promise<boolean> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return false;
  const all: UserProfile[] = Object.values(snap.val());
  return all.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.uid !== excludeUid);
};

// ─── Check if apartment already has an owner ─────────────────────────────────
export const isApartmentTakenByOwner = async (apartmentId: string, excludeUid?: string): Promise<boolean> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return false;
  const all: UserProfile[] = Object.values(snap.val());
  return all.some((u) => u.apartmentId === apartmentId && u.residentType === 'owner' && u.uid !== excludeUid);
};

// ─── Get all residents (for visitor host selection) ──────────────────────────
export const getResidents = async (): Promise<UserProfile[]> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return [];
  const all: UserProfile[] = Object.values(snap.val());
  return all.filter((u) => u.role === 'resident' && u.status === 'active');
};

// ─── Count residents in an apartment ─────────────────────────────────────────
export const countResidentsInApartment = async (apartmentId: string): Promise<number> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return 0;
  const all: UserProfile[] = Object.values(snap.val());
  return all.filter((u) => u.apartmentId === apartmentId && u.role === 'resident' && u.status !== 'rejected').length;
};

// ─── Get pending users ────────────────────────────────────────────────────────
export const getPendingUsers = async (): Promise<UserProfile[]> => {
  const snap = await get(ref(database, 'users'));
  if (!snap.exists()) return [];
  const all: UserProfile[] = Object.values(snap.val());
  return all.filter((u) => u.status === 'pending');
};

// ─── Approve User ─────────────────────────────────────────────────────────────
export const approveUser = async (uid: string, apartmentId?: string): Promise<void> => {
  await update(ref(database, `users/${uid}`), { status: 'active', rejectionReason: null });
  if (apartmentId) {
    await update(ref(database, `apartments/${apartmentId}`), { status: 'occupied' });
  }
};

// ─── Reject User ──────────────────────────────────────────────────────────────
export const rejectUser = async (uid: string, reason: string): Promise<void> => {
  await update(ref(database, `users/${uid}`), { status: 'rejected', rejectionReason: reason });
};
