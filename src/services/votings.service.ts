import { ref, set, get, update, remove, push, onValue, off, DataSnapshot, runTransaction } from 'firebase/database';
import { database } from '../config/firebase';
import { Voting, VotingOption } from '../types';

const PATH = 'votings';

export const createVoting = async (data: Omit<Voting, 'id' | 'voters'>): Promise<string> => {
  const newRef = push(ref(database, PATH));
  const id = newRef.key!;
  await set(newRef, { ...data, id, voters: {} });
  return id;
};

export const updateVoting = async (id: string, data: Partial<Voting>): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), data);
};

export const deleteVoting = async (id: string): Promise<void> => {
  await remove(ref(database, `${PATH}/${id}`));
};

export const closeVoting = async (id: string): Promise<void> => {
  await update(ref(database, `${PATH}/${id}`), { status: 'closed' });
};

export const castVote = async (
  votingId: string,
  userId: string,
  optionId: string
): Promise<{ committed: boolean }> => {
  // Use transaction to ensure atomic, race-condition-safe vote counting
  const votingRef = ref(database, `${PATH}/${votingId}`);
  return runTransaction(votingRef, (current: Voting | null) => {
    if (!current) return current;          // Node missing — abort
    if (current.voters?.[userId]) return;  // Already voted — abort (return undefined)
    if (current.status !== 'open') return; // Voting closed — abort

    const voters = { ...(current.voters ?? {}), [userId]: optionId };
    const options = (current.options ?? []).map((opt: VotingOption) =>
      opt.id === optionId ? { ...opt, votes: (opt.votes ?? 0) + 1 } : opt
    );
    return { ...current, voters, options };
  });
};

export const getVotings = async (): Promise<Voting[]> => {
  const snap = await get(ref(database, PATH));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Voting>)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const subscribeToVotings = (callback: (votings: Voting[]) => void) => {
  const dbRef = ref(database, PATH);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Voting>)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
