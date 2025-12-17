import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useUserContext } from '../context/UserContext';
import { Typography, Box, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import PsychedelicSmoke from '../components/PsychedelicSmoke';

const Home = () => {
  const { username } = useUserContext();
  const navigate = useNavigate();

  const mainContent = username ? (
    <Box sx={{ textAlign: 'center', mt: 8, maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <SelfImprovementIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h1" gutterBottom sx={{
        background: 'linear-gradient(45deg, #81C784 30%, #64B5F6 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 4
      }}>
        Welcome Back, {username}
      </Typography>

      <PsychedelicSmoke />

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/session')}
        sx={{
          fontSize: '1.2rem',
          px: 6,
          py: 2,
          borderRadius: 50,
          textTransform: 'none',
          mt: 4
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
