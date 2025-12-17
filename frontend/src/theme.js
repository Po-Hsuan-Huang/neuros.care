import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#81C784', // Soft green for primary actions (calming, nature)
      light: '#B2FAB4',
      dark: '#519657',
      contrastText: '#000000',
    },
    secondary: {
      main: '#64B5F6', // Soft blue for secondary actions (water, flow)
      light: '#9BE7FF',
      dark: '#2286C3',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Deep dark background
      paper: '#1E1E1E',   // Slightly lighter for cards/surfaces
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
    error: {
      main: '#CF6679',
    },
    success: {
      main: '#81C784',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill shape
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #66BB6A 30%, #81C784 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #42A5F5 30%, #64B5F6 90%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI overlay
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        },
        elevation3: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
});