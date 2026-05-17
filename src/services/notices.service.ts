import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { Notice } from '../types';

const PATH = 'notices';

export const createNotice = async (data: Omit<Notice, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateNotice = async (id: string, data: Partial<Notice>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), { ...data, updatedAt: Date.now() });
};

export const deleteNotice = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getNotices = async (): Promise<Notice[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Notice>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeToNotices = (callback: (notices: Notice[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Notice>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
