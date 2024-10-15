import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Container, Box, Typography, Card, CardMedia, CardContent, CircularProgress,
    Pagination, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const ListingsAndReviewsSearch = ({ facetsQuery = {}, searchQuery = '' }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9);
    const [hasMore, setHasMore] = useState(true);

    const stockImageUrl = "/static/images/mongodb-logo.png";

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
            const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ page, limit, facetsQuery, searchQuery })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            setHasMore(result.length === limit); // Determine if there's more data to load
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page, limit, facetsQuery, searchQuery);
    }, [page, limit, facetsQuery, searchQuery]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">
                    Unable to fetch data: {error.message}
                </Typography>
            </Container>
        );
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
        setPage(1); // Reset to the first page when limit changes
    };

    return (
        <Container>
            <Box sx={{ padding: 2 }}>
                {data && data.length > 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginLeft: -1, // Adjust for spacing
                            marginRight: -1 // Adjust for spacing
                        }}
                    >
                        {data.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: '1 0 calc(33.3333% - 16px)',
                                    maxWidth: 'calc(33.3333% - 16px)',
                                    paddingLeft: 1,
                                    paddingRight: 1,
                                    marginBottom: 2,
                                    boxSizing: 'border-box',
                                    display: 'flex', // Flexbox to allow stretching
                                    flexDirection: 'column' // Columnar layout
                                }}
                            >
                                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={item.images && isValidURL(item.images.picture_url) ? item.images.picture_url : stockImageUrl}
                                        alt={item.name || 'Stock Image'}
                                        />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {item.summary}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No listings found.</Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
                <Pagination
                    count={hasMore ? page + 1 : page} // Show next page only if there might be more data
                    page={page}
                    onChange={handlePageChange}
                />
                <FormControl variant="outlined" size="small" style={{ minWidth: 120, marginLeft: '16px' }}>
                    <InputLabel id="limit-label">Limit</InputLabel>
                    <Select
                        labelId="limit-label"
                        value={limit}
                        onChange={handleLimitChange}
                        label="Limit"
                    >
                        <MenuItem value={9}>9</MenuItem>
                        <MenuItem value={18}>18</MenuItem>
                        <MenuItem value={36}>36</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Container>
    );
};

ListingsAndReviewsSearch.propTypes = {
    facetsQuery: PropTypes.shape({
        amenities: PropTypes.arrayOf(PropTypes.string),
        propertyType: PropTypes.arrayOf(PropTypes.string),
        beds: PropTypes.arrayOf(PropTypes.string)
    }),
    searchQuery: PropTypes.string
};

export default ListingsAndReviewsSearch;