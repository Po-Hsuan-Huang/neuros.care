import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CircularProgress, Box, Typography } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import YogaSession from './pages/YogaSession';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import SessionCallback from './pages/SessionCallback';
import { useUserContext } from './context/UserContext';
import { SnapshotProvider } from './context/SnapshotContext';

function App() {
  const { username } = useUserContext();
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    // 1. Silent ping to wake up Render backend immediately
    fetch("https://neuros-backend.onrender.com/ping")
      .then(() => setIsWakingUp(false)) // It's awake!
      .catch(() => {
        // If it fails or takes too long, we keep isWakingUp true 
        // or handle error state here
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SnapshotProvider username={username}>
        <BrowserRouter>
          <Layout>
            {/* 2. Show the "Waking up" message if the server is cold */}
            {isWakingUp && (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'info.light' }}>
                <Typography variant="body2">
                  🚀 Waking up our AI servers (this may take 30 seconds)...
                </Typography>
              </Box>
            )}

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/session" element={<YogaSession />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/auth/callback" element={<SessionCallback />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SnapshotProvider>
    </ThemeProvider>
  );
}

export default App;