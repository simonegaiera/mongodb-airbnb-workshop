import { useEffect, useState } from 'react';

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const renderCheckboxes = (category, buckets, showAll, setShowAll) => {
    const displayedBuckets = showAll ? buckets : buckets.slice(0, 5);

    return (
      <div className="space-y-2">
        {displayedBuckets.map((bucket) => (
          <label key={bucket} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedFacets[category]?.includes(bucket) || false}
              onChange={handleCheckboxChange(category, bucket)}
            />
            <span>{bucket}</span>
          </label>
        ))}
        {buckets.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        )}
        <button 
          onClick={clearSelection(category)} 
          className="text-red-600 hover:text-red-800 ml-4"
        >
          Clear
        </button>
      </div>
    );
  };

  const renderRadios = (category, buckets, showAll, setShowAll) => {
    const displayedBuckets = showAll ? buckets : buckets.slice(0, 5);

    return (
      <div className="space-y-2">
        {displayedBuckets.map((bucket) => (
          <label key={bucket} className="flex items-center space-x-2">
            <input
              type="radio"
              className="border-gray-300 text-blue-600 focus:ring-blue-500"
              value={bucket}
              checked={selectedFacets[category] === bucket}
              onChange={(event) => handleRadioChange(category, event.target.value)(event)}
              name={category}
            />
            <span>{bucket}</span>
          </label>
        ))}
        {buckets.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        )}
        <button 
          onClick={clearSelection(category)} 
          className="text-red-600 hover:text-red-800 ml-4"
        >
          Clear
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 h-[80vh] overflow-y-auto relative z-[9999] bg-white">
      <h2 className="text-2xl font-bold mb-4">Filters</h2>
      <hr className="my-4" />
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Amenities</h3>
        {renderCheckboxes('amenities', amenities, showAllAmenities, setShowAllAmenities)}
      </div>
      <hr className="my-4" />
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Property Types</h3>
        {renderRadios('propertyType', propertyTypes, showAllPropertyTypes, setShowAllPropertyTypes)}
      </div>
      <hr className="my-4" />
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Beds</h3>
        {renderRadios('beds', beds, showAllBeds, setShowAllBeds)}
      </div>
    </div>
  );
};

export default Filters;