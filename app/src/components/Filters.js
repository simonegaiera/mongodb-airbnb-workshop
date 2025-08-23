import { useEffect, useState } from 'react';
import ExerciseStatus from './ExerciseStatus';

const Filters = ({ selectedFacets, setSelectedFacets }) => {
  const [amenities, setAmenities] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState(null);
  const [beds, setBeds] = useState(["1-2", "3-4", "5-8", "8-12"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPropertyTypes, setShowAllPropertyTypes] = useState(false);
  const [showAllBeds, setShowAllBeds] = useState(false);

  useEffect(() => {
    const fetchData = async (url, setter, fieldName) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        const filteredData = data.filter(item => item !== null && item !== "");

        setter(filteredData);
      } catch (error) {
        console.error(`Error fetching ${fieldName} data:`, error);
        throw error; // Re-throw to be caught by the main error handler
      }
    };

    const loadFilters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchData(`${process.env.BASE_URL}/api/listingsAndReviews/distinct?field=amenities`, setAmenities, 'amenities'),
          fetchData(`${process.env.BASE_URL}/api/listingsAndReviews/distinct?field=property_type`, setPropertyTypes, 'property types')
        ]);
      } catch (error) {
        setError(error.message);
        // Set fallback data so the component can still function
        setAmenities([]);
        setPropertyTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
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

  if (loading) {
    return (
      <div className="p-4 h-[80vh] overflow-y-auto relative z-[9999] bg-white">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        
        {/* Exercise Status for crud-3 */}
        <div className="px-2 py-1 mb-2">
          <ExerciseStatus exerciseName="crud-3" />
        </div>
        
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading filters...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-[80vh] overflow-y-auto relative z-[9999] bg-white">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        
        {/* Exercise Status for crud-3 */}
        <div className="px-2 py-1 mb-2">
          <ExerciseStatus exerciseName="crud-3" />
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <h3 className="text-red-800 font-medium">Unable to load filter options</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">
            Error: {error}
          </p>
          <p className="text-red-600 text-xs mt-2">
            This might indicate that the filter API endpoint is not implemented or the server is not running.
          </p>
        </div>
        
        {/* Still show beds filter since it doesn't depend on API */}
        <hr className="my-4" />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Beds</h3>
          {renderRadios('beds', beds, showAllBeds, setShowAllBeds)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-[80vh] overflow-y-auto relative z-[9999] bg-white">
      <h2 className="text-2xl font-bold mb-4">Filters</h2>
      
      {/* Exercise Status for crud-3 */}
      <div className="px-2 py-1 mb-2">
        <ExerciseStatus exerciseName="crud-3" />
      </div>
      
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
