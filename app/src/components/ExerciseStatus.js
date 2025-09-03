'use client';

import React, { useEffect, useState } from 'react';

const ExerciseStatus = ({ exerciseName }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExerciseStatus = async (name) => {
        if (!name) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/results/filter?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setStatus(result);
        } catch (error) {
            console.error('Error fetching exercise status:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExerciseStatus(exerciseName);
    }, [exerciseName]);

    if (!exerciseName) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
                <span className="text-sm text-gray-600">Checking...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-500">Error</span>
            </div>
        );
    }

    if (status === null) {
        return null;
    }

    // Hide exercise if it's not listed in the scenario
    if (status.isListed === false) {
        return null;
    }

    const isCompleted = status.count === 1;

    return (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
            }`}>
                {isCompleted && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span className={`text-sm ${
                isCompleted ? 'text-green-700 font-medium' : 'text-gray-600'
            }`}>
                {exerciseName}
            </span>
        </div>
    );
};

export default ExerciseStatus;
