import { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Typography, Divider,
  FormControl, FormControlLabel, Checkbox
} from '@mui/material';

const FacetComponent = ({ selectedFacets, setSelectedFacets, autocompleteQuery }) => {
  const [facets, setFacets] = useState(null);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/facet?query=${autocompleteQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFacets(data[0].facet);
      } catch (error) {
        console.error('Error fetching facets:', error);
      }
    };

    if (autocompleteQuery) { // Only fetch facets if there's an autocompleteQuery
      fetchFacets();
    }
  }, [autocompleteQuery]);  // Re-fetch facets when autocompleteQuery changes

  const handleCheckboxChange = (category, value) => (event) => {
    setSelectedFacets((prevState) => {
      const currentSelections = prevState[category];
      if (event.target.checked) {
        // Add the value to the selection
        return {
          ...prevState,
          [category]: [...currentSelections, value]
        };
      } else {
        // Remove the value from the selection
        return {
          ...prevState,
          [category]: currentSelections.filter((item) => item !== value)
        };
      }
    });
  };

  if (!facets) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  const renderCheckboxes = (category, buckets) => {
    return (
      <FormControl component="fieldset">
        {buckets.map((bucket) => (
          <FormControlLabel
            key={bucket._id}
            control={
              <Checkbox
                checked={selectedFacets[category].includes(bucket._id)}
                onChange={handleCheckboxChange(category, bucket._id)}
              />
            }
            label={`${bucket._id} (${bucket.count})`}
          />
        ))}
      </FormControl>
    );
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Facets with Search</Typography>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Amenities</Typography>
        {renderCheckboxes('amenities', facets.amenities.buckets)}
      </Box>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Property Types</Typography>
        {renderCheckboxes('propertyType', facets.property_type.buckets)}
      </Box>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Beds</Typography>
        {renderCheckboxes('beds', facets.beds.buckets)}
      </Box>
    </Box>
  );
};

export default FacetComponent;