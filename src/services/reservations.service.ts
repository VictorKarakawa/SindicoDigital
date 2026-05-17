import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { Reservation } from '../types';

const PATH = 'reservations';

export const createReservation = async (data: Omit<Reservation, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateReservation = async (id: string, data: Partial<Reservation>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteReservation = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getReservations = async (): Promise<Reservation[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Reservation>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeToReservations = (callback: (reservations: Reservation[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Reservation>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
