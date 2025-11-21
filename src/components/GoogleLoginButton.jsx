import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useUserContext } from '../context/UserContext';

// Define the URL for your Flask-Dance login blueprint
const LOGIN_URL = "http://localhost:5000/google/login";

function GoogleLoginButton() {
  const { username } = useUserContext();

  if (username) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h5" sx={{ color: 'primary.main' }}>
          Welcome back, {username}!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Button
        variant="contained"
        size="large"
        href={LOGIN_URL}
        startIcon={<GoogleIcon />}
        sx={{
          background: 'linear-gradient(45deg, #4285F4 30%, #34A853 90%)',
          color: 'white',
          fontSize: '1.1rem',
          px: 6,
          py: 2,
          borderRadius: 50,
          textTransform: 'none',
          boxShadow: '0 4px 20px rgba(66, 133, 244, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3367D6 30%, #2D8E47 90%)',
            boxShadow: '0 6px 24px rgba(66, 133, 244, 0.6)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        Sign in with Google
      </Button>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
        Securely sign in to access your personalized yoga journey and track your progress.
      </Typography>
    </Box>
  );
}

export default GoogleLoginButton;