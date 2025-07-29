import React, {useRef} from 'react';
import { Typography, Box } from '@mui/material';
import { useUser } from '../context/UserContext';


const Profile = () => {

  const { username } = useUser();

  return (
    <Box>
      <Typography variant="h4">Profile</Typography>
      Hi, {username}.<br/>
    </Box>
  );
};

export default Profile;
