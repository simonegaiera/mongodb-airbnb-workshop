// components/AutocompleteComponent.js

import React, { useState, useEffect, useRef } from 'react';

function AutocompleteComponent({ query, setQuery }) {
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const wrapperRef = useRef(null);
    const debounceTimeout = useRef(null);

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
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Search"
            />
            {isOpen && options.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
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
        </div>
    );
}

export default AutocompleteComponent;