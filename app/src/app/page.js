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
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: '30%', // 30% width
            mr: 2, // Margin right for spacing
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
            flexShrink: 0,
            flexBasis: '70%', // 70% width
          }}
        >
          <Box sx={{ mt: 2 }}> {/* Margin top for spacing */}
          <Typography variant="h6" align="left" gutterBottom>
                Statistics
            </Typography>
            <ListingStatistics />
          </Box>
          <Box sx={{ mt: 2 }}> {/* Margin top for spacing */}
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