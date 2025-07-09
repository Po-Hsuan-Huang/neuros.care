import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4A6670', // Calming blue-grey - promotes trust and stability
      light: '#718792', // Softer shade for hover states and highlights
      dark: '#334852', // Deeper tone for active states and emphasis
      contrastText: '#FFFFFF', // Ensuring readable text on primary colors
    },
    secondary: {
      main: '#8BA888', // Soft sage green - connects to nature and growth
      light: '#A8C1A5', // Gentle highlight for interactive elements
      dark: '#6E8F6B', // Grounding shade for focused states
      contrastText: '#333333', // Accessible text contrast
    },
    background: {
      default: '#F5F5F5', // Soft off-white for reduced eye strain
      paper: '#FFFFFF', // Clean white for content areas
    },
    error: {
      main: '#B5838D', // Muted rose instead of harsh red for errors
      light: '#E5B3BC',
      dark: '#925A63',
    },
    success: {
      main: '#7FA685', // Gentle green for success states
      light: '#A3C2A9',
      dark: '#5C8A62',
    },
    text: {
      primary: '#333333', // Soft black for main text
      secondary: '#666666', // Gentle grey for secondary text
    }
  },
  typography: {
    fontFamily: 'Nunito, sans-serif', // Rounded, friendly primary font
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.4, // Improved readability
      letterSpacing: '-0.01em', // Slightly tighter for headings
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontFamily: 'Open Sans, sans-serif', // Clear, readable body font
      lineHeight: 1.6, // Generous line height for better readability
      letterSpacing: '0.01em', // Slightly loose for body text
    },
    button: {
      textTransform: 'none', // Avoiding aggressive all-caps
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12, // Soft corners for all components
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300, // Matches natural breathing rhythm
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth, natural transitions
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },
  spacing: (factor) => `${0.8 * factor}rem`, // Base spacing unit for consistency
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '0.8rem 1.6rem', // More generous click targets
          borderRadius: '2rem', // Pill-shaped buttons feel less aggressive
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', // Subtle shadows
          borderRadius: '1rem',
        },
      },
    },
  },
});