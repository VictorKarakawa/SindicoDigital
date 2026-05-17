import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { Space } from '../types';

const PATH = 'spaces';

export const createSpace = async (data: Omit<Space, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateSpace = async (id: string, data: Partial<Space>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteSpace = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getSpaces = async (): Promise<Space[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Space>);
};

export const subscribeToSpaces = (callback: (spaces: Space[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, Space>));
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
