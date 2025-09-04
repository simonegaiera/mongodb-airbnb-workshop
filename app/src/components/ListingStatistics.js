import React, { useEffect, useState } from 'react';
import ExerciseStatus from './ExerciseStatus';

const ListingStatistics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Market Segment
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Average Price
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Properties
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg Reviews
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.beds} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.beds === 0 ? 'Studio' : `${item.beds} Bedroom${item.beds > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <span className="text-sm font-bold text-green-600">
                                        ${item.averagePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <span className="text-sm text-gray-900">
                                        {item.propertyCount?.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">units</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <span className="text-sm text-gray-900">
                                        {item.averageReviews?.toFixed(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
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
