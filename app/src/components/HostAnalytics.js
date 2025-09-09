import React, { useEffect, useState } from 'react';
import ExerciseStatus from './ExerciseStatus';

const HostAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to format price values that might be MongoDB $numberDecimal objects
    const formatPrice = (price) => {
        if (!price) return '0';
        
        // Handle MongoDB $numberDecimal format
        if (typeof price === 'object' && price.$numberDecimal) {
            return parseFloat(price.$numberDecimal).toLocaleString();
        }
        
        // Handle regular numbers
        if (typeof price === 'number') {
            return price.toLocaleString();
        }
        
        // Handle string numbers
        if (typeof price === 'string') {
            return parseFloat(price).toLocaleString();
        }
        
        return '0';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/hostanalytics`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                setData(result);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Unable to fetch host analytics data:', error);
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
                {/* Exercise Status for pipeline-2 */}
                <div className="px-4 py-2 mb-2">
                    <ExerciseStatus exerciseName="pipeline-2" />
                </div>
                
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-600">Loading host analytics...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Exercise Status for pipeline-2 */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <ExerciseStatus exerciseName="pipeline-2" />
                </div>
                
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            <h3 className="text-red-800 font-medium">Unable to load host analytics</h3>
                        </div>
                        <p className="text-red-600 text-sm mt-1">
                            Error: {error}
                        </p>
                        <p className="text-red-600 text-xs mt-2">
                            This might indicate that the host analytics API endpoint is not implemented or the server is not running.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative">
            {/* Exercise Status for pipeline-2 */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 relative z-10">
                <ExerciseStatus exerciseName="pipeline-2" />
            </div>
            
            <div className="p-3">
                <div className="grid grid-cols-2 gap-3 relative z-0">
                    {data.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
                            {/* Host Type Header */}
                            <div className="text-center mb-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.hostType === 'Superhost' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {item.hostType}
                                </span>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2">
                                {/* Avg Rating */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Avg Rating:</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-blue-600">
                                            {item.avgRating || 'N/A'}
                                        </span>
                                        {item.avgRating && (
                                            <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Avg Reviews */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Avg Reviews:</span>
                                    <span className="text-sm font-bold text-green-600">
                                        {item.avgReviews || 0}
                                    </span>
                                </div>

                                {/* Avg Price */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Avg Price:</span>
                                    <span className="text-sm font-bold text-purple-600">
                                        ${formatPrice(item.avgPrice)}
                                    </span>
                                </div>

                                {/* Properties */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Properties:</span>
                                    <span className="text-sm font-bold text-indigo-600">
                                        {item.totalProperties || 0}
                                    </span>
                                </div>

                                {/* Response Rate */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Response Rate:</span>
                                    <span className="text-sm font-bold text-orange-600">
                                        {item.avgResponseRate ? `${item.avgResponseRate}%` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HostAnalytics;
