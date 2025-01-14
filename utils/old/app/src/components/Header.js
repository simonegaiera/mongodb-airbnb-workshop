"use client";

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Tabs, Tab } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Header() {
  const [value, setValue] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Set the correct tab value based on the current pathname
    if (pathname === '/search') {
      setValue(1);
    } else if (pathname === '/leaderboard') {
      setValue(2);
    } else {
      setValue(0);
    }
  }, [pathname]);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#023430' }}>
      <Toolbar>
        <Avatar
          alt="Company Logo"
          src={`${process.env.BASE_PATH}/static/images/mongodb-logo.png`}
          sx={{ marginRight: 2 }}
        />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          Listing And Reviews
        </Typography>

        <Tabs value={value} aria-label="navigation tabs" sx={{ '.MuiTab-root': { color: 'white' } }}>
          <Tab label="Home" component={Link} href="/" />
          <Tab label="Search" component={Link} href="/search" />
          <Tab label="Leaderboard" component={Link} href="/leaderboard" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
