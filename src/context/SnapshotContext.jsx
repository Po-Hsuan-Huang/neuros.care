// src/context/SnapshotContext.js
import React, { createContext, useContext } from 'react';
import { useSnapshotQueue } from '../components/utils/useSnapshotQueue';

// Create context
const SnapshotContext = createContext(null);

// Provider component
export const SnapshotProvider = ({ username, children }) => {
  const snapshotQueue = useSnapshotQueue(username);

  return (
    <SnapshotContext.Provider value={snapshotQueue}>
      {children}
    </SnapshotContext.Provider>
  );
};

// Custom hook to use context
export const useSnapshotContext = () => {
  const context = useContext(SnapshotContext);
  if (!context) {
    throw new Error('useSnapshotContext must be used within a SnapshotProvider');
  }
  return context;
};
