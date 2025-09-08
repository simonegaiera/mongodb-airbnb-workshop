'use client';

import React, { useEffect, useState } from 'react';

const ExerciseStatus = ({ exerciseName }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

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

    const exerciseStatus = status.status || 'not_attempted';
    const isCompleted = exerciseStatus === 'completed';
    const isFailed = exerciseStatus === 'failed';
    const hasFailureReason = isFailed && status.failure_reason;

    const getStatusIcon = () => {
        if (isCompleted) {
            return (
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (isFailed) {
            return (
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            );
        }
        return null;
    };

    const getStatusColor = () => {
        if (isCompleted) return 'bg-green-500';
        if (isFailed) return 'bg-red-500';
        return 'bg-gray-300';
    };

    const getTextColor = () => {
        if (isCompleted) return 'text-green-700 font-medium';
        if (isFailed) return 'text-red-700 font-medium';
        return 'text-gray-600';
    };

    return (
        <div className="flex items-center gap-2 relative">
            <div 
                className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor()} ${hasFailureReason ? 'cursor-help' : ''}`}
                onMouseEnter={() => hasFailureReason && setShowTooltip(true)}
                onMouseLeave={() => hasFailureReason && setShowTooltip(false)}
            >
                {getStatusIcon()}
            </div>
            <span className={`text-sm ${getTextColor()}`}>
                {exerciseName}
            </span>
            
            {/* Tooltip for failure reason */}
            {hasFailureReason && showTooltip && (
                <div className="absolute z-50 bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs">
                    <div className="font-medium mb-1">Exercise Failed:</div>
                    <div>{status.failure_reason}</div>
                    {status.last_updated && (
                        <div className="text-gray-300 mt-1 text-xs">
                            Last updated: {new Date(status.last_updated).toLocaleString()}
                        </div>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default ExerciseStatus;
