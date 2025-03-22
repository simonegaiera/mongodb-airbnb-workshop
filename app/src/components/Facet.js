import { useEffect, useState } from 'react';

const FacetComponent = ({ selectedFacets, setSelectedFacets, autocompleteQuery }) => {
  const [facets, setFacets] = useState(null);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/facet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: autocompleteQuery })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFacets(data[0].facet);
      } catch (error) {
        console.error('Error fetching facets:', error);
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

  if (!facets) {
    return (
      <div className="flex justify-center items-center h-screen motion-preset-slide-right">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
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