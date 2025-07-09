import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h2" gutterBottom>
        Welcome to AI Yoga Assistant
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Your personal guide to perfect yoga poses
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => navigate('/session')}
      >
        Start Yoga Session
      </Button>
    </Box>
  );
};

export default Home;
