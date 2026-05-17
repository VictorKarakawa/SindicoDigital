import { useEffect, useState } from 'react';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Generic hook to subscribe to a Firebase Realtime Database path.
 * Automatically parses array of values from Firebase object.
 */
export function useRealtime<T>(
  path: string,
  transform?: (snap: DataSnapshot) => T[]
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    const dbRef = ref(database, path);

    const handler = (snap: DataSnapshot) => {
      try {
        if (!snap.exists()) {
          setData([]);
        } else if (transform) {
          setData(transform(snap));
        } else {
          const val = snap.val();
          const list: T[] = typeof val === 'object' && !Array.isArray(val)
            ? Object.values(val)
            : [val];
          setData(list);
        }
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };

    const errHandler = () => {
      setError('Falha na conexão com o banco de dados.');
      setLoading(false);
    };

    onValue(dbRef, handler, errHandler);
    return () => off(dbRef, 'value', handler);
  }, [path]);

  return { data, loading, error };
}
