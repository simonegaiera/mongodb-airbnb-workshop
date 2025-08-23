'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ListingTile from './ListingTile';
import PropertyDialog from './PropertyDialog';
import ExerciseStatus from './ExerciseStatus';

const ListingsAndReviews = ({ filters = {} }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [hasMore, setHasMore] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);

    const stockImageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

    const isValidURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const isEmptyFilters = (filters) => {
        return Object.values(filters).every(value => {
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            return !value;
        });
    };

    const fetchData = async (page, limit, filters, append = false) => {
        setLoading(true);
        try {
            let response;

            if (isEmptyFilters(filters)) {
                response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews?page=${page}&limit=${limit}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/filter`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ page, limit, filters })
                });
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            if (append) {
                setData(prevData => [...prevData, ...result]);
            } else {
                setData(result);
            }
            setHasMore(result.length === limit);
            setError(null); // Clear any previous errors on successful fetch
        } catch (error) {
            console.error('Unable to fetch listings data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
            if (hasMore && !loading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchData(nextPage, limit, filters, true);
            }
        }
    }, [hasMore, loading, page, limit, filters]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        fetchData(page, limit, filters);
    }, [filters, limit]); // Remove page from dependencies since we'll handle it manually

    // if (error) {
    //     return (
    //         <div className="container mx-auto">
    //             <p className="text-red-500">
    //                 Unable to fetch data: {error.message}
    //             </p>
    //         </div>
    //     );
    // }

    const handleLimitChange = (event) => {
        setLimit(Number(event.target.value));
        setPage(1);
        setData([]); // Clear existing data when changing limit
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
        <div className="container mx-auto">
            <div className="motion-delay-50 motion-delay-100 motion-delay-150 motion-delay-200 motion-delay-250 motion-delay-300 motion-delay-350 motion-delay-400 motion-delay-450 motion-delay-500"></div>
            
            {/* Exercise Status - Horizontal Layout */}
            <div className="flex flex-wrap gap-4 px-4 py-4">
                <ExerciseStatus exerciseName="crud-1" />
                <ExerciseStatus exerciseName="crud-4" />
                <ExerciseStatus exerciseName="index" />
                <ExerciseStatus exerciseName="crud-5" />
            </div>
            
            <div className="p-4">
                {data && data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {data.map((item, index) => (
                                <ListingTile key={index} sequence={index} item={item} index={index} handleClick={handleClick} isValidURL={isValidURL} stockImageUrl={stockImageUrl} />
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-center mt-8 gap-4">
                            {loading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            )}
                        </div>
                    </>
                ) : (
                    loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600">Loading listings...</span>
                        </div>
                    ) : (
                        error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                                    <h3 className="text-red-800 font-medium">Unable to load listings</h3>
                                </div>
                                <p className="text-red-600 text-sm mt-1">
                                    Error: {error.message}
                                </p>
                                <p className="text-red-600 text-xs mt-2">
                                    This might indicate that the listings API endpoint is not implemented or the server is not running.
                                </p>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">No listings found.</p>
                        )
                    )
                )}
            </div>

            {selectedItemId !== null && dialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
                        <button
                            onClick={handleClose}
                            className="float-right text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <PropertyDialog id={selectedItemId} open={dialogOpen} onClose={handleClose} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingsAndReviews;
