import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography } from '@mui/material';

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
                    value: Math.round(parseFloat(item.avgPrice.$numberDecimal)),
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
        return <CircularProgress />;
    }

    const greyShade1 = '#f5f5f5';  // Light grey
    const greyShade2 = '#e0e0e0';  // Darker grey

    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {data.map((item, index) => (
                                <TableCell
                                    key={item.id}
                                    style={{ backgroundColor: index % 2 === 0 ? greyShade1 : greyShade2, textAlign: "center" }}
                                >
                                    {item.id}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {data.map((item, index) => (
                                <TableCell
                                    key={item.id}
                                    align="center"
                                    style={{ backgroundColor: index % 2 === 0 ? greyShade1 : greyShade2 }}
                                >
                                    {item.value}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ListingStatistics;