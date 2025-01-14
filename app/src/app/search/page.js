'use client';

import React, { useState } from 'react';
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
    <div className="container mx-auto px-4">
      <div className="flex flex-row items-start">
        {autocompleteQuery && (
          <div className="flex-[0_0_30%] mr-4 animate-slide-in w-2/3">
            <FacetComponent
              selectedFacets={selectedFacets}
              setSelectedFacets={setSelectedFacets}
              autocompleteQuery={autocompleteQuery}
            />
          </div>
        )}
        <div className={`${autocompleteQuery ? 'flex-[0_0_70%]' : 'flex-1'}`}>
          <div className="mt-4">
            <AutocompleteComponent
              query={autocompleteQuery}
              setQuery={setAutocompleteQuery}
            />
          </div>
          <div className="mt-4">
            <ListingsAndReviewsSearch
              facetsQuery={selectedFacets}
              searchQuery={autocompleteQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}