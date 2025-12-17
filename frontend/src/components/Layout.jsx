import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navigation from './Navigation';

const StyledMain = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{
              textAlign: 'left',
              width: '100%',
              color: 'inherit'
            }}
          >
            Neuros, train your brain with AI.
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ width: '280px', flexShrink: 0 }}>
        {/* This empty Toolbar acts as a spacer */}
        <Toolbar />
        <Navigation />
      </Box>
      
      <Box sx={{ flexGrow: 1 }}>
        {/* This empty Toolbar acts as a spacer */}
        <Toolbar />
        <StyledMain>{children}</StyledMain>
      </Box>
    </Box>
  );
};

export default Layout;