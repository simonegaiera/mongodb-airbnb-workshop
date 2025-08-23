// components/AutocompleteComponent.js

import React, { useState, useEffect, useRef } from 'react';
import ExerciseStatus from './ExerciseStatus';

function AutocompleteComponent({ query, setQuery }) {
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (query) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/autocomplete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query }),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setOptions(data || []);
                } catch (error) {
                    console.error('Error fetching autocomplete options:', error);
                    setError(error.message);
                    setOptions([]); // Clear options on error
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        // Clear the previous debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Set a new debounce timeout
        debounceTimeout.current = setTimeout(() => {
            setQuery(value); // Update the query after the debounce delay
        }, 300); // Adjust the delay as needed (300ms is common)
        
        setIsOpen(true);
    };

    const handleOptionClick = (option) => {
        setInputValue(option);
        setQuery(option);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="px-4 py-2 mb-2">
                <ExerciseStatus exerciseName="search-1" />
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Search"
            />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {loading && (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                            Loading suggestions...
                        </div>
                    )}
                    {error && (
                        <div className="p-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                                    <h3 className="text-red-800 font-medium">Unable to load suggestions</h3>
                                </div>
                                <p className="text-red-600 text-sm mt-1">
                                    Error: {error}
                                </p>
                                <p className="text-red-600 text-xs mt-2">
                                    This might indicate that the autocomplete API endpoint is not implemented or the server is not running.
                                </p>
                            </div>
                        </div>
                    )}
                    {!loading && !error && options.length > 0 && (
                        <ul>
                            {options.map((option, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleOptionClick(option.name)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    {option.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {!loading && !error && options.length === 0 && query && (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                            No suggestions found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AutocompleteComponent;
