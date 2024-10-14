import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#023430' }}>
      <Toolbar>
        <Avatar 
          alt="Company Logo" 
          src="/static/images/mongodb-logo.png" 
          sx={{ marginRight: 2 }} 
        />
        <Typography variant="h5" component="div">
          Listing And Reviews
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
export default Header;