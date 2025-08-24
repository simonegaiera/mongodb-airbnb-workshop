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
                // Process result to round average price to the nearest integer
                const processedData = result.map(item => {
                    // Handle both response formats
                    const price = item.price?.$numberDecimal 
                        ? parseFloat(item.price.$numberDecimal)
                        : parseFloat(item.price);
                    
                    return {
                        id: item.beds,
                        value: Math.round(price),
                    };
                });
                setData(processedData);
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
            <div className="overflow-x-auto">
                {/* Exercise Status for pipeline-1 */}
                <div className="px-4 py-2 mb-2">
                    <ExerciseStatus exerciseName="pipeline-1" />
                </div>
                
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
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Exercise Status for pipeline-1 */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <ExerciseStatus exerciseName="pipeline-1" />
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {data.map((item) => (
                                <th
                                    key={item.id}
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {item.id} Beds
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            {data.map((item) => (
                                <td
                                    key={item.id}
                                    className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-green-600">
                                            ${item.value.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            Avg Price
                                        </span>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListingStatistics;
