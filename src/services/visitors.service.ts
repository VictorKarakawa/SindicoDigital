import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { Visitor } from '../types';

const PATH = 'visitors';

export const createVisitor = async (data: Omit<Visitor, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateVisitor = async (id: string, data: Partial<Visitor>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteVisitor = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getVisitors = async (): Promise<Visitor[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Visitor>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const getVisitorById = async (id: string): Promise<Visitor | null> => {
  const snap = await get(ref(database, `${PATH}/${id}`));
  return snap.exists() ? (snap.val() as Visitor) : null;
};

export const subscribeToVisitors = (callback: (visitors: Visitor[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Visitor>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

export const checkinVisitor = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'checked_in',
    checkinAt: Date.now(),
  });
};

export const checkoutVisitor = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'checked_out',
    checkoutAt: Date.now(),
  });
};

export const approveVisitor = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'approved',
  });
};

// ─── Search visitors locally ─────────────────────────────────────────────────
export const searchVisitors = (query: string, visitors: Visitor[]): Visitor[] => {
  if (!query.trim()) return visitors;
  const q = query.toLowerCase();
  return visitors.filter((v) => {
    const cpfClean = (v.cpf ?? '').replace(/\D/g, '');
    return (
      v.name.toLowerCase().includes(q) ||
      cpfClean.includes(q.replace(/\D/g, '')) ||
      (v.email ?? '').toLowerCase().includes(q)
    );
  });
};

// ─── Check if a visitor with this CPF already has an active visit ────────────
export const isVisitorCPFActive = async (cpf: string, excludeId?: string): Promise<boolean> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return false;
  const all = Object.values(snap.val() as Record<string, Visitor>);
  return all.some(
    (v) =>
      v.cpf === cpf &&
      v.id !== excludeId &&
      (v.status === 'pending' || v.status === 'approved' || v.status === 'checked_in')
  );
};
