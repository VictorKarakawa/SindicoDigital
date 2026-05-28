import { ref, set, get, update, remove, push, onValue, off, DataSnapshot, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';
import { Visit } from '../types';

const PATH = 'visits';

export const createVisit = async (data: Omit<Visit, 'id'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateVisit = async (id: string, data: Partial<Visit>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteVisit = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const getVisits = async (): Promise<Visit[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Visit>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const getVisitById = async (id: string): Promise<Visit | null> => {
  const snap = await get(ref(database, `${PATH}/${id}`));
  return snap.exists() ? (snap.val() as Visit) : null;
};

export const getVisitsByVisitorId = async (visitorId: string): Promise<Visit[]> => {
  const visitsRef = query(ref(database, PATH), orderByChild('visitorId'), equalTo(visitorId));
  const snap = await get(visitsRef);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Visit>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeToVisits = (callback: (visits: Visit[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Visit>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

export const subscribeToVisitorVisits = (visitorId: string, callback: (visits: Visit[]) => void) => {
  const dbRef = query(ref(database, PATH), orderByChild('visitorId'), equalTo(visitorId));
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Visit>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

export const checkinVisit = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'checked_in',
    checkinAt: Date.now(),
  });
};

export const checkoutVisit = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'checked_out',
    checkoutAt: Date.now(),
  });
};

export const approveVisit = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), {
    status: 'approved',
  });
};

// ─── Search visits locally ─────────────────────────────────────────────────
export const searchVisits = (queryText: string, visits: Visit[]): Visit[] => {
  if (!queryText.trim()) return visits;
  const q = queryText.toLowerCase();
  return visits.filter((v) => {
    const cpfClean = (v.visitorCpf ?? '').replace(/\D/g, '');
    return (
      (v.visitorName ?? '').toLowerCase().includes(q) ||
      cpfClean.includes(q.replace(/\D/g, ''))
    );
  });
};

export const isVisitorCPFActive = async (cpf: string, excludeVisitId?: string): Promise<boolean> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return false;
  const all = Object.values(snap.val() as Record<string, Visit>);
  return all.some(
    (v) =>
      v.visitorCpf === cpf &&
      v.id !== excludeVisitId &&
      (v.status === 'pending' || v.status === 'approved' || v.status === 'checked_in')
  );
};
