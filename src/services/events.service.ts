import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { CondominiumEvent } from '../types';

const PATH = 'events';

export const createEvent = async (data: Omit<CondominiumEvent, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateEvent = async (id: string, data: Partial<CondominiumEvent>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteEvent = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const subscribeToEvents = (callback: (events: CondominiumEvent[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, CondominiumEvent>)
      .sort((a, b) => a.date - b.date);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
