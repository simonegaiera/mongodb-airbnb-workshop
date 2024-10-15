'use client';

import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import FacetComponent from '@/components/Facet';
import AutocompleteComponent from '@/components/AutocompleteSearch';
import ListingsAndReviewsSearch from '@/components/ListingAndReviewsSearch';

export default function Home() {
  const [selectedFacets, setSelectedFacets] = useState({
    amenities: [],
    propertyType: [],
    beds: []
  });
  const [autocompleteQuery, setAutocompleteQuery] = useState('');

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
            flex: '1 1 30%', // Adjust the width as needed
            mr: 2 // Margin right for spacing
          }}
        >
          <FacetComponent
            selectedFacets={selectedFacets}
            setSelectedFacets={setSelectedFacets}
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 70%', // Adjust the width as needed
          }}
        >
          <Box sx={{ mt: 2 }}>
            <AutocompleteComponent
              query={autocompleteQuery}
              setQuery={setAutocompleteQuery}
            />
          </Box>
          <Box sx={{ mt: 2 }}> {/* Margin top for spacing */}
            <ListingsAndReviewsSearch
              facetsQuery={selectedFacets}
              searchQuery={autocompleteQuery}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}