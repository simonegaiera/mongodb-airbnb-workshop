import React, { useEffect, useState } from 'react';
import ExerciseStatus from './ExerciseStatus';

const ListingStatistics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to format price values that might be MongoDB $numberDecimal objects
    const formatPrice = (price) => {
        if (!price) return '0.00';
        
        // Handle MongoDB $numberDecimal format
        if (typeof price === 'object' && price.$numberDecimal) {
            return parseFloat(price.$numberDecimal).toFixed(2);
        }
        
        // Handle regular numbers
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        
        // Handle string numbers
        if (typeof price === 'string') {
            return parseFloat(price).toFixed(2);
        }
        
        return '0.00';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/statistics`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                // New format includes comprehensive investment metrics
                setData(result);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Unable to fetch statistics data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="overflow-x-auto">
                {/* Exercise Status for pipeline-1 */}
                <div className="px-4 py-2 mb-2">
                    <ExerciseStatus exerciseName="pipeline-1" />
                </div>
                
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-600">Loading statistics...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Exercise Status for pipeline-1 */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <ExerciseStatus exerciseName="pipeline-1" />
                </div>
                
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            <h3 className="text-red-800 font-medium">Unable to load statistics</h3>
                        </div>
                        <p className="text-red-600 text-sm mt-1">
                            Error: {error}
                        </p>
                        <p className="text-red-600 text-xs mt-2">
                            This might indicate that the statistics API endpoint is not implemented or the server is not running.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Exercise Status for pipeline-1 */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <ExerciseStatus exerciseName="pipeline-1" />
            </div>
            
            <div className="p-3">
                <div className="flex flex-wrap gap-2">
                    {data.map((item) => (
                        <div key={item.beds} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-2">
                            {/* Market Segment Header */}
                            <div className="text-center mb-2">
                                <span className="text-xs font-semibold text-blue-800">
                                    {item.beds === 0 ? 'Studio' : `${item.beds}BR`}
                                </span>
                            </div>

                            {/* Investment Metrics - Compact */}
                            <div className="space-y-1 text-center">
                                {/* Average Price */}
                                <div>
                                    <div className="text-xs text-gray-500">Price</div>
                                    <div className="text-xs font-bold text-green-600">
                                        ${formatPrice(item.averagePrice)}
                                    </div>
                                </div>

                                {/* Property Count */}
                                <div>
                                    <div className="text-xs text-gray-500">Units</div>
                                    <div className="text-xs font-bold text-blue-600">
                                        {item.propertyCount?.toLocaleString()}
                                    </div>
                                </div>

                                {/* Average Reviews */}
                                <div>
                                    <div className="text-xs text-gray-500">Reviews</div>
                                    <div className="text-xs font-bold text-purple-600">
                                        {item.averageReviews?.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No investment data available</p>
                        <p className="text-xs mt-1">Complete the pipeline-1 exercise to see market segments</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingStatistics;
