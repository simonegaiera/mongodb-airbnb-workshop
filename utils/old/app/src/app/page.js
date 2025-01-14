'use client';

import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ListingsAndReviews from '@/components/ListingAndReviews';
import Filters from '@/components/Filters';
import ListingStatistics from '@/components/ListingStatistics';
import { Typography } from '@mui/material';

export default function Home() {
  const [selectedFacets, setSelectedFacets] = useState({
    amenities: [],
    propertyType: "",
    beds: ""
  });

  return (
    <Container
      maxWidth="xl"
      sx={{
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          flexWrap: 'wrap' // Allow wrapping if space is not sufficient
        }}
      >
        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 1, // Allow shrinking if needed
            flexBasis: '30%',
            maxWidth: '30%' // Ensure it does not exceed 30%
          }}
        >
          <Filters
            selectedFacets={selectedFacets}
            setSelectedFacets={setSelectedFacets}
          />
        </Box>

        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 1, // Allow shrinking if needed
            flexBasis: '70%',
            maxWidth: '70%', // Ensure it does not exceed 70%
            overflow: 'hidden' // Prevent content spilling out
          }}
        >
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" align="left" gutterBottom>
              Statistics
            </Typography>
            <ListingStatistics />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" align="left" gutterBottom>
              Listings
            </Typography>
            <ListingsAndReviews filters={selectedFacets} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}