import { ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';
import { Block, Apartment } from '../types';

// ─── Blocks ──────────────────────────────────────────────────────────────────

export const createBlock = async (data: Omit<Block, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'blocks'));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateBlock = async (id: string, data: Partial<Block>): Promise<void> => {
  await update(ref(database, `blocks/${id}`), data);
};

export const deleteBlock = async (id: string): Promise<void> => {
  await remove(ref(database, `blocks/${id}`));
};

export const getBlocks = async (): Promise<Block[]> => {
  const snap = await get(ref(database, 'blocks'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Block>)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const subscribeToBlocks = (callback: (blocks: Block[]) => void) => {
  const dbRef = ref(database, 'blocks');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Block>)
      .sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

// ─── Apartments ──────────────────────────────────────────────────────────────

export const createApartment = async (data: Omit<Apartment, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'apartments'));
  const id = newRef.key!;
  await set(newRef, { ...data, id });
  return id;
};

export const updateApartment = async (id: string, data: Partial<Apartment>): Promise<void> => {
  await update(ref(database, `apartments/${id}`), data);
};

export const deleteApartment = async (id: string): Promise<void> => {
  // Check if occupied before deleting
  const snap = await get(ref(database, `apartments/${id}`));
  if (snap.exists() && snap.val().status === 'occupied') {
    throw new Error('Não é possível excluir um apartamento ocupado.');
  }
  await remove(ref(database, `apartments/${id}`));
};

export const getApartments = async (): Promise<Apartment[]> => {
  const snap = await get(ref(database, 'apartments'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Apartment>)
    .sort((a, b) => {
      // Sort by block name then apartment number
      const aBlock = a.blockName || '';
      const bBlock = b.blockName || '';
      if (aBlock !== bBlock) return aBlock.localeCompare(bBlock);
      return a.number.localeCompare(b.number);
    });
};

export const subscribeToApartments = (callback: (apartments: Apartment[]) => void) => {
  const dbRef = ref(database, 'apartments');
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { callback([]); return; }
    const list = Object.values(snap.val() as Record<string, Apartment>)
      .sort((a, b) => {
        const aBlock = a.blockName || '';
        const bBlock = b.blockName || '';
        if (aBlock !== bBlock) return aBlock.localeCompare(bBlock);
        return a.number.localeCompare(b.number);
      });
    callback(list);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

// Update apartment status when user is added/removed
export const updateApartmentOccupancy = async (apartmentId: string, status: 'available' | 'occupied'): Promise<void> => {
  await update(ref(database, `apartments/${apartmentId}`), { status });
};
