"use client";

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Switch, FormControlLabel } from '@mui/material';
import { useRouter } from 'next/navigation';

function Header() {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set the correct state of the switch based on the current pathname
    setChecked(window.location.pathname === '/search');
  }, []);

  const handleChange = (event) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);

    if (isChecked) {
      router.push('/search');
    } else {
      router.push('/');
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#023430' }}>
      <Toolbar>
        <Avatar 
          alt="Company Logo" 
          src="/static/images/mongodb-logo.png" 
          sx={{ marginRight: 2 }} 
        />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          Listing And Reviews
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={checked}
              onChange={handleChange}
              name="pageSwitch"
              color="primary"
            />
          }
          label="Enable Search"
          labelPlacement="start"
        />
      </Toolbar>
    </AppBar>
  );
}

export default Header;