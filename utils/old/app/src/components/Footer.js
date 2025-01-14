import React from 'react';
import { Container, Typography, Link, Box } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ padding: '1rem 0' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          sx={{ color: '#023430' }} 
          align="center"
        >
          {'© '}
          <Link color="inherit" href="https://www.mongodb.com" sx={{ color: '#023430' }}>
            MongoDB
          </Link>{' '}
          {new Date().getFullYear()}
        </Typography>
        <Box mt={2} textAlign="center">
          <Link href="https://www.mongodb.com/blog" color="inherit" sx={{ color: '#023430' }}>
            Our Blog
          </Link>{' | '}
          <Link 
            href="https://university.mongodb.com" 
            color="inherit" 
            sx={{ color: '#023430', marginLeft: 1, marginRight: 1 }}
          >
            MongoDB University
          </Link>{' | '}
          <Link 
            href="https://www.linkedin.com/company/mongodb/" 
            color="inherit" 
            sx={{ color: '#023430', marginLeft: 1 }}
          >
            LinkedIn
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;