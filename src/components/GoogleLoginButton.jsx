import React from 'react';
import { Button } from '@mui/material';
import { useUserContext } from '../context/UserContext'; 

// Define the URL for your Flask-Dance login blueprint
// Use your production domain (dev.neuros.care)
const LOGIN_URL = "https://dev.neuros.care/login/"; 

function GoogleLoginButton() {
  // Assuming useUserContext provides 'username' or 'isLoggedIn'
  const { username } = useUserContext(); 

  if (username) {
    // If the user is logged in, show a welcome message
    return <div>Welcome back, {username}!</div>;
  }

  // If the user is NOT logged in, show the login button.
  // We use a standard anchor tag <a> to redirect the browser to the Flask backend's OAuth starting URL.
  return (
    <Button 
      variant="contained" 
      color="primary"
      // CRUCIAL: Direct link to your Flask backend's login route
      href={LOGIN_URL} 
      sx={{ mt: 2 }} // Example styling
    >
      Login with Google 🚀
    </Button>
  );
}

export default GoogleLoginButton;