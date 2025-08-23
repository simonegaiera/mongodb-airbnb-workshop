import { useEffect, useState } from 'react';
import ExerciseStatus from './ExerciseStatus';

const FacetComponent = ({ selectedFacets, setSelectedFacets, autocompleteQuery }) => {
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacets = async () => {
      setLoading(true);
      try {
        setError(null);
        const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/facet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: autocompleteQuery })
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setFacets(data[0].facet);
      } catch (error) {
        console.error('Error fetching facets:', error);
        setError(error.message);
        setFacets(null);
      } finally {
        setLoading(false);
      }
    };

    if (autocompleteQuery) { 
      fetchFacets();
    }
  }, [autocompleteQuery]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen motion-preset-slide-right">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading facets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="px-4 py-2 mb-2">
          <ExerciseStatus exerciseName="search-2" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <h3 className="text-red-800 font-medium">Unable to load facets</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">
            Error: {error}
          </p>
          <p className="text-red-600 text-xs mt-2">
            This might indicate that the facets API endpoint is not implemented or the server is not running.
          </p>
        </div>
      </div>
    );
  }

  if (!facets) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">No facets available.</p>
      </div>
    );
  }

  const renderCheckboxes = (category, buckets) => {
    return (
      <div className="flex flex-col space-y-2">
        {buckets.map((bucket) => (
          <label key={bucket._id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={selectedFacets[category].includes(bucket._id)}
              onChange={handleCheckboxChange(category, bucket._id)}
            />
            <span className="text-gray-700">{`${bucket._id} (${bucket.count})`}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="px-4 py-2 mb-2">
        <ExerciseStatus exerciseName="search-2" />
      </div>
      <h2 className="text-xl font-semibold mb-4">Facets with Search</h2>
      <hr className="border-gray-200 my-4" />
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Amenities</h3>
        {renderCheckboxes('amenities', facets.amenities.buckets)}
      </div>
      <hr className="border-gray-200 my-4" />
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Property Types</h3>
        {renderCheckboxes('propertyType', facets.property_type.buckets)}
      </div>
      <hr className="border-gray-200 my-4" />
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Beds</h3>
        {renderCheckboxes('beds', facets.beds.buckets)}
      </div>
    </div>
  );
};

export default FacetComponent;
