'use client';

import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ListingsAndReviews from '@/components/ListingAndReviews';
import FacetComponent from '@/components/Facet';
import AutocompleteComponent from '@/components/AutocompleteSearch';

// Utility function to generate a query string from selected facets
const generateQueryFromFacets = (selectedFacets) => {
  // Implement the query generation logic based on your requirements
  return JSON.stringify(selectedFacets);
};

export default function Home() {
  const [currentQuery, setCurrentQuery] = useState('{}');
  const [selectedFacets, setSelectedFacets] = useState({
    amenities: [],
    propertyType: [],
    beds: []
  });
  const [autocompleteQuery, setAutocompleteQuery] = useState('hawaii');

  useEffect(() => {
    const queryString = generateQueryFromFacets(selectedFacets);
    setCurrentQuery(queryString);
  }, [selectedFacets]);

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
          <AutocompleteComponent query={autocompleteQuery} setQuery={setAutocompleteQuery} />
          <Box sx={{ mt: 2 }}> {/* Margin top for spacing */}
            <ListingsAndReviews query={currentQuery} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}