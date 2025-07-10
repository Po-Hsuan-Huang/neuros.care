import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navigation from './Navigation';

const StyledMain = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  marginTopL: '64px',
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Neuros, train your brain with AI.
          </Typography>
        </Toolbar>
      </AppBar>
      <Navigation />
      <StyledMain>{children}</StyledMain>
    </Box>
  );
};

export default Layout;
