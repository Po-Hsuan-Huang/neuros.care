import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { useSnapshotContext } from '../context/SnapshotContext';

const Progress = () => {
  const { getSnapshots } = useSnapshotContext();
  const snapshots = getSnapshots();

  // Group snapshots by poseName
  const grouped = snapshots.reduce((acc, snap) => {
    if (!acc[snap.poseName]) acc[snap.poseName] = [];
    acc[snap.poseName].push(snap);
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Progress
      </Typography>

      {Object.entries(grouped).map(([poseName, snaps]) => (
        <Box key={poseName} sx={{ mb: 4 }}>
          <Typography variant="h6">{poseName}</Typography>
          <Grid container spacing={2}>
            {snaps.map((snap, index) => {
              const url = URL.createObjectURL(snap.snapshot);
              return (
                <Grid item key={index}>
                  <img
                    src={url}
                    alt={`Snapshot of ${poseName}`}
                    width={160}
                    height={120}
                    style={{ borderRadius: 4 }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default Progress;
