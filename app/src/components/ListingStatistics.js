import React, { useEffect, useState } from 'react';

const ListingStatistics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/statistics`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                // Process result to round average price to the nearest integer
                const processedData = result.map(item => ({
                    id: item._id,
                    value: Math.round(parseFloat(item.avgPrice?.$numberDecimal)),
                }));
                setData(processedData);
            } catch (error) {
                console.error('Unable to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full bg-white shadow-md rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            {data.map((item, index) => (
                                <th
                                    key={item.id}
                                    className={`px-4 py-2 text-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}
                                >
                                    {item.id}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {data.map((item, index) => (
                                <td
                                    key={item.id}
                                    className={`px-4 py-2 text-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}
                                >
                                    {item.value}
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