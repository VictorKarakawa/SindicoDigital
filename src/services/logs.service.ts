import { ref, set, get, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { AdminLog, LogAction, LogTarget } from '../types';

const PATH = 'logs';

// ─── Log an administrative action ────────────────────────────────────────────
export const logAction = async (
  data: Omit<AdminLog, 'id'>
): Promise<void> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
};

// ─── Subscribe to all logs ───────────────────────────────────────────────────
export const subscribeToLogs = (
  callback: (logs: AdminLog[]) => void
) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snap.val() as Record<string, AdminLog>)
      .sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

// ─── Get recent logs ─────────────────────────────────────────────────────────
export const getRecentLogs = async (limit = 50): Promise<AdminLog[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  const all = Object.values(snap.val() as Record<string, AdminLog>)
    .sort((a, b) => b.timestamp - a.timestamp);
  return all.slice(0, limit);
};

// ─── Helper to create log entry from context ─────────────────────────────────
export const createLogEntry = (
  userId: string,
  userName: string,
  action: LogAction,
  target: LogTarget,
  targetId: string,
  targetName: string,
  details?: string
): Omit<AdminLog, 'id'> => ({
  userId,
  userName,
  action,
  target,
  targetId,
  targetName,
  details,
  timestamp: Date.now(),
});
