import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box 
} from '@mui/material';
import { 
  Home, 
  FitnessCenter, 
  Person, 
  Timeline 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const drawerWidth = 240;

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Yoga Session', icon: <FitnessCenter />, path: '/session' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Progress', icon: <Timeline />, path: '/progress' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', marginTop: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navigation;
