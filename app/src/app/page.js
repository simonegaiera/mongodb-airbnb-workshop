'use client';

import dynamic from 'next/dynamic';
import React, { useState, useRef, useEffect } from 'react';
import ListingAndReviews from '@/components/ListingAndReviews';
import Filters from '@/components/Filters';
import ListingStatistics from '@/components/ListingStatistics';

const ListingAndReviewsMap = dynamic(
  () => import('@/components/ListingAndReviewsMap'),
  { ssr: false }
);

export default function Home() {
  const [selectedFacets, setSelectedFacets] = useState({
    amenities: [],
    propertyType: "",
    beds: ""
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listShown, setListShown] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const filterRef = useRef(null);

  const handleOpenFilters = () => setFiltersOpen(true);
  const handleCloseFilters = () => setFiltersOpen(false);
  const toggleListMap = () => setListShown(!listShown);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        handleCloseFilters();
      }
    };

    if (filtersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtersOpen]);

  
  return (
    <div className="container max-w-[1536px] overflow-hidden motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
      
        <div className="mb-8">
          <div className="flex gap-4">
            <button 
              onClick={handleOpenFilters}
              className="ml-24 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" 
              style={{display: "block", fill: "none", height: "16px", width: "16px", stroke: "currentColor", strokeWidth: 3, overflow: "visible"}}
                aria-hidden="true" role="presentation" focusable="false"><path fill="none" d="M7 16H3m26 0H15M29 6h-4m-8 0H3m26 20h-4M7 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM17 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 20a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0H3"></path></svg>
              Filters
            </button>
            <button 
              onClick={toggleListMap}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 px-5 py-3.5  rounded-3xl flex items-center gap-2  bg-[#222222] text-white  rounded-full hover:scale-105 transition-transform text-sm "
            >{listShown ? (
              <div className="flex items-center gap-2">
                Show map
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 32 32" 
                  aria-hidden="true" 
                  role="presentation" 
                  focusable="false" 
                  style={{display: "block", height: "16px", width: "16px", fill: "white"}}
                  
                >
                  <path d="M31.25 3.75a2.29 2.29 0 0 0-1.01-1.44A2.29 2.29 0 0 0 28.5 2L21 3.67l-10-2L2.5 3.56A2.29 2.29 0 0 0 .7 5.8v21.95a2.28 2.28 0 0 0 1.06 1.94A2.29 2.29 0 0 0 3.5 30L11 28.33l10 2 8.49-1.89a2.29 2.29 0 0 0 1.8-2.24V4.25a2.3 2.3 0 0 0-.06-.5zM12.5 25.98l-1.51-.3L9.5 26H9.5V4.66l1.51-.33 1.49.3v21.34zm10 1.36-1.51.33-1.49-.3V6.02l1.51.3L22.5 6h.01v21.34z" />
                </svg>
              </div>
            ) :  <div className="flex items-center gap-2">
                Show list
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style={{display: "block", height: "16px", width: "16px", fill: "white"}}><path fillRule="evenodd" d="M2.5 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 12v2H6v-2h9zM2.5 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 7v2H6V7h9zM2.5 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 2v2H6V2h9z"></path></svg>
              </div>}</button>
          </div>
          {filtersOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div ref={filterRef} className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button 
                    onClick={handleCloseFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <Filters
                  selectedFacets={selectedFacets}
                  setSelectedFacets={setSelectedFacets}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          {listShown && (
            <div>
              <div className="flex items-center gap-2 mb-4 mx-24">
                <input
                  type="checkbox"
                  id="showStatistics"
                  className="h-4 w-4"
                  onChange={(e) => setShowStatistics(e.target.checked)}
                />
                <label htmlFor="showStatistics" className="text-sm text-gray-500">
                  Show Statistics
                </label>
              </div>
              
              {showStatistics && (
                <div className="mt-8 mx-24">
                  <h2 className="text-xl font-semibold text-left mb-6">
                    Statistics
                  </h2>
                  <ListingStatistics />
                </div>
              )}
            </div>
          )}
          <div className="mt-8">
            {listShown ? (
              <ListingAndReviews filters={selectedFacets} />
            ) : (
              <ListingAndReviewsMap filters={selectedFacets} />
            )}
          </div>
        </div>
    </div>
  );
}