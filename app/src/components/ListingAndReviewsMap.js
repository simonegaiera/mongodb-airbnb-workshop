'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ListingTile from './ListingTile';

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
});

// Component to handle map events
const MapEventHandler = ({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange(bounds);
        },
    });
    return null;
};

const ListingAndReviewsMap = ({ filters = {} }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);
    const [hasMore, setHasMore] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [mapCenter, setMapCenter] = useState([ 40.73061, -73.935242]); 
    const [mapZoom, setMapZoom] = useState(12);
    const [currentBounds, setCurrentBounds] = useState(null);
    const [searchArea, setSearchArea] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const stockImageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

    const defaultBounds = {
        sw: [-74.15462493896486, 40.65251317049883],
        ne: [-73.71517181396486, 40.80861223601287]
    };

    const isValidURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const fetchData = async (page, limit, filters) => {
        try {
            const filtersWithBounds = {
                ...filters
            };

            if (!filters.bounds) {
                filtersWithBounds.bounds = [
                    defaultBounds.sw,
                    defaultBounds.ne
                ];
            }

            const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ page, limit, filters: filtersWithBounds })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            setHasMore(result.length === limit);
            
            // Update map center based on first listing if available
            if (result.length > 0 && result[0].address?.location?.coordinates) {
                const [lng, lat] = result[0].address.location.coordinates;
                setMapCenter([lat, lng]);
            }
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page, limit, filters);
    }, [page, limit, filters]);

    if (loading) {
        return (
            <div className="container mx-auto">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto">
                <p className="text-red-500">
                    Unable to fetch data: {error.message}
                </p>
            </div>
        );
    }

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (event) => {
        setLimit(Number(event.target.value));
        setPage(1);
    };

    const handleBoundsChange = (bounds) => {
        setCurrentBounds(bounds);
        setSearchArea(bounds);
        // handleSearchArea();
    };

    const handleSearchArea = async () => {
        if (!currentBounds) return;
        setIsSearching(true);
        
        const sw = currentBounds.getSouthWest();
        const ne = currentBounds.getNorthEast();
        
        const newFilters = {
            ...filters,
            "bounds":  [
                        [sw.lng, sw.lat], // Bottom Left (SW)
                        [ne.lng, ne.lat]  // Top Right (NE)
                    ]
        };

        await fetchData(1, limit, newFilters);
        setIsSearching(false);
    };

    return (
        <div className="container flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <div className="ml-24 text-lg font-semibold">{data.length} properties found</div>
                {currentBounds && (
                    <div>
                        {isSearching ? (
                            <div className="px-4 py-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleSearchArea} 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Search This Area
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="fixed bottom-0 left-0 right-0 h-[500px] w-screen">
                <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100vw' }}
                    className="z-0" // Add lower z-index to ensure map stays below filters
                    minZoom={3}
                    maxBounds={[[-90, -180], [90, 180]]} // Restrict scrolling beyond valid latitudes
                    maxBoundsViscosity={1.0} // Make the bounds "hard" - no bouncing
                >
                    <MapEventHandler onBoundsChange={handleBoundsChange} />
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution=''
                    />
                    {data.map((item, index) => {
                        if (item.address?.location?.coordinates) {
                            const [lng, lat] = item.address.location.coordinates;
                            return (
                                <Marker key={index} position={[lat, lng]}>
                                    <Popup>
                                        <ListingTile key={index} item={item} index={index}  isValidURL={isValidURL} stockImageUrl={stockImageUrl} />
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>

        </div>
    );
};

ListingAndReviewsMap.propTypes = {
    filters: PropTypes.shape({
        amenities: PropTypes.arrayOf(PropTypes.string),
        propertyType: PropTypes.string,
        beds: PropTypes.string
    })
};

export default ListingAndReviewsMap;
