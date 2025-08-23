'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropertyDialog from './PropertyDialog';
import ListingTile from './ListingTile';

const ListingsAndReviewsSearch = ({ 
  facetsQuery = {}, 
  searchQuery = '' 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const stockImageUrl = `${process.env.BASE_PATH}/static/images/mongodb-logo.png`;

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchData = async (page, limit, facetsQuery, searchQuery) => {
    setLoading(true);
    try {
      setError(null); // Clear any previous errors
      const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page, limit, facetsQuery, searchQuery })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // If we have data, use it
      if (result && Array.isArray(result) && result.length > 0) {
        if (page === 1) {
          setData(result);
        } else {
          setData(prevData => [...prevData, ...result]);
        }
        setHasMore(result.length === limit);
      } else {
        // Response is ok but no data
        if (page === 1) {
          setData([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError(error.message);
      if (page === 1) {
        setData([]); // Clear data on error for first page
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, limit, facetsQuery, searchQuery);
  }, [page, limit, facetsQuery, searchQuery]);

  // Add this useEffect to reset the page and data when facetsQuery or searchQuery changes
  useEffect(() => {
    setPage(1);
    setData([]);
  }, [facetsQuery, searchQuery]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <h3 className="text-red-800 font-medium">Unable to load search results</h3>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Error: {error}
            </p>
            <p className="text-red-600 text-xs mt-2">
              This might indicate that the search API endpoint is not implemented or the server is not running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
    setData([]);
  };

  const handleClick = (itemId) => {
    setSelectedItemId(itemId);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="py-8">
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((item, index) => {
              if (data.length === index + 1) {
                return (
                  <div ref={lastElementRef} key={index}>
                    <ListingTile 
                      sequence={index} 
                      item={item} 
                      index={index} 
                      handleClick={handleClick} 
                      isValidURL={isValidURL} 
                      stockImageUrl={stockImageUrl} 
                    />
                  </div>
                );
              } else {
                return (
                  <ListingTile 
                    key={index} 
                    sequence={index} 
                    item={item} 
                    index={index} 
                    handleClick={handleClick} 
                    isValidURL={isValidURL} 
                    stockImageUrl={stockImageUrl} 
                  />
                );
              }
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No listings found.</p>
        )}
        {loading && page > 1 && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>


      {selectedItemId && dialogOpen && (
        <PropertyDialog id={selectedItemId} open={dialogOpen} onClose={handleClose} />
      )}
    </div>
  );
};

export default ListingsAndReviewsSearch;
