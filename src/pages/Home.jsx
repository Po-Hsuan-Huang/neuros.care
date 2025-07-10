import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h2" gutterBottom>
      Love and compassion are necessities, not luxuries.
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
      "It is under the greatest adversity that there exists the greatest potential for doing good, both for oneself and others.
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
