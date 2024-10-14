// components/AutocompleteComponent.js

import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

function AutocompleteComponent({ query, setQuery }) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (query) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/autocomplete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query }),
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setOptions(data || []);
                } catch (error) {
                    console.error('Error fetching autocomplete options:', error);
                }
            };

            fetchData();
        }
    }, [query]);

    return (
        <Autocomplete
            freeSolo
            options={options.map(option => option.name)}
            onInputChange={(event, newInputValue) => {
                setQuery(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    );
}

export default AutocompleteComponent;