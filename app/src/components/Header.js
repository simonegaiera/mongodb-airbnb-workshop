"use client";

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Switch, FormControlLabel, Tabs, Tab } from '@mui/material';
import { useRouter } from 'next/navigation';

function Header() {
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Set the correct state of the switch based on the current pathname
    setChecked(window.location.pathname === '/search');
    // Set the correct tab value based on the current pathname
    if (window.location.pathname === '/leaderboard') {
      setValue(1);
    } else {
      setValue(0);
    }
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

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 1) {
      setChecked(false); // Uncheck the switch when selecting the leaderboard tab
      router.push('/leaderboard');
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

        <Tabs value={value} onChange={handleTabChange} aria-label="navigation tabs"
          sx={{ '.MuiTab-root': { color: 'white' } }}
        >
          <Tab label="Home" />
          <Tab label="Leaderboard" />
        </Tabs>

        {value !== 1 && (
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
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
