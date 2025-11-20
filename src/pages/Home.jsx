import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useUserContext } from '../context/UserContext';
import { Typography, Box, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

const Home = () => {
  const { username } = useUserContext();
  const navigate = useNavigate();

  const mainContent = username ? (
    <Box sx={{ textAlign: 'center', mt: 8, maxWidth: 800, mx: 'auto' }}>
      <SelfImprovementIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h1" gutterBottom sx={{
        background: 'linear-gradient(45deg, #81C784 30%, #64B5F6 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 4
      }}>
        Welcome Back, {username}
      </Typography>

      <Paper elevation={0} sx={{ p: 4, mb: 6, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          "It is under the greatest adversity that there exists the greatest potential for doing good, both for oneself and others."
        </Typography>
      </Paper>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/session')}
        sx={{
          fontSize: '1.2rem',
          px: 6,
          py: 2,
          borderRadius: 50,
          textTransform: 'none'
        }}
      >
        Start Your Session
      </Button>
    </Box>
  ) : (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h2" gutterBottom>
        Find Your Balance
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
        AI-powered yoga assistance to help you perfect your form and find inner peace.
      </Typography>
      <GoogleLoginButton />
    </Box>
  );

  return (
    <Container maxWidth="lg">
      {mainContent}
    </Container>
  );
};

export default Home;

