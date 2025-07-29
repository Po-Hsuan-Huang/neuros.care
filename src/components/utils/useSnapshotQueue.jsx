import { useRef } from 'react';

export function useSnapshotQueue(username) {
  const queueRef = useRef([]);

  const addSnapshot = (snapshot) => {
    queueRef.current.push({
      username,
      timestamp: Date.now(),
      snapshot,
    });
  };

  const getSnapshots = () => [...queueRef.current];

  const clearSnapshots = () => {
    queueRef.current = [];
  };

  return {
    addSnapshot,
    getSnapshots,
    clearSnapshots,
  };
}
