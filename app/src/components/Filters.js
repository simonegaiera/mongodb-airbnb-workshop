import { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Typography, Divider,
  FormControl, FormControlLabel, Checkbox, Radio, Button, RadioGroup
} from '@mui/material';

const Filters = ({ selectedFacets, setSelectedFacets }) => {
  const [amenities, setAmenities] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState(null);
  const [beds, setBeds] = useState(["1-2", "3-4", "5-8", "8-12"]);

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPropertyTypes, setShowAllPropertyTypes] = useState(false);
  const [showAllBeds, setShowAllBeds] = useState(false);

  useEffect(() => {
    const fetchData = async (url, setter) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter out null values
        const filteredData = data.filter(item => item !== null && item !== "");

        setter(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(`${process.env.BASE_URL}/api/listingsAndReviews/distinct?field=amenities`, setAmenities);
    fetchData(`${process.env.BASE_URL}/api/listingsAndReviews/distinct?field=property_type`, setPropertyTypes);
  }, []);

  const handleCheckboxChange = (category, value) => (event) => {
    setSelectedFacets((prevState) => {
      const currentSelections = prevState[category] || [];
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

  const handleRadioChange = (category, value) => (event) => {
    setSelectedFacets((prevState) => ({
      ...prevState,
      [category]: value
    }));
  };

  const clearSelection = (category) => () => {
    setSelectedFacets((prevState) => ({
      ...prevState,
      [category]: (category === 'amenities' ? [] : "")
    }));
  };

  if (!amenities || !propertyTypes) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  const renderCheckboxes = (category, buckets, showAll, setShowAll) => {
    const displayedBuckets = showAll ? buckets : buckets.slice(0, 5);

    return (
      <FormControl component="fieldset">
        {displayedBuckets.map((bucket) => (
          <FormControlLabel
            key={bucket}
            control={
              <Checkbox
                checked={selectedFacets[category]?.includes(bucket) || false}
                onChange={handleCheckboxChange(category, bucket)}
              />
            }
            label={bucket}
          />
        ))}
        {buckets.length > 5 && (
          <Button onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        )}
        <Button onClick={clearSelection(category)} color="secondary">
          Clear
        </Button>
      </FormControl>
    );
  };

  const renderRadios = (category, buckets, showAll, setShowAll) => {
    const displayedBuckets = showAll ? buckets : buckets.slice(0, 5);

    return (
      <FormControl component="fieldset">
        <RadioGroup
          value={selectedFacets[category] || ""}
          onChange={(event) => handleRadioChange(category, event.target.value)(event)}
        >
          {displayedBuckets.map((bucket) => (
            <FormControlLabel
              key={bucket}
              value={bucket}
              control={<Radio />}
              label={bucket}
            />
          ))}
        </RadioGroup>
        {buckets.length > 5 && (
          <Button onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        )}
        <Button onClick={clearSelection(category)} color="secondary">
          Clear
        </Button>
      </FormControl>
    );
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Filters</Typography>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Amenities</Typography>
        {renderCheckboxes('amenities', amenities, showAllAmenities, setShowAllAmenities)}
      </Box>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Property Types</Typography>
        {renderRadios('propertyType', propertyTypes, showAllPropertyTypes, setShowAllPropertyTypes)}
      </Box>
      <Divider />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Beds</Typography>
        {renderRadios('beds', beds, showAllBeds, setShowAllBeds)}
      </Box>
    </Box>
  );
};

export default Filters;