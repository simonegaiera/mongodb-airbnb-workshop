'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ListingTile from './ListingTile';
import PropertyDialog from './PropertyDialog';

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

    const fetchData = async (page, limit, filters, append = false) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ page, limit, filters })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(filters);
            const result = await response.json();
            if (append) {
                setData(prevData => [...prevData, ...result]);
            } else {
                setData(result);
            }
            setHasMore(result.length === limit);
            setLoading(false);
        } catch (error) {
            setError(error);
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

    if (error) {
        return (
            <div className="container mx-auto">
                <p className="text-red-500">
                    Unable to fetch data: {error.message}
                </p>
            </div>
        );
    }

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
                        <></>
                    ) : (
                        <p className="text-center text-gray-600">No listings found.</p>
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