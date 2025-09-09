'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const ExerciseStatus = ({ exerciseName }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetailsBox, setShowDetailsBox] = useState(false);
    const detailsRef = useRef(null);

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

    // Close modal when escape key is pressed
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && showDetailsBox) {
                setShowDetailsBox(false);
            }
        };

        if (showDetailsBox) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [showDetailsBox]);

    const handleStatusClick = () => {
        setShowDetailsBox(!showDetailsBox);
    };

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
                className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor()} cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all`}
                onClick={handleStatusClick}
            >
                {getStatusIcon()}
            </div>
            <span 
                className={`text-sm ${getTextColor()} cursor-pointer hover:underline`}
                onClick={handleStatusClick}
            >
                {exerciseName}
            </span>
            
            {/* Details box for exercise status */}
            {showDetailsBox && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setShowDetailsBox(false)}
                    style={{ zIndex: 999999 }}
                >
                    <div 
                        ref={detailsRef}
                        className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 relative"
                        onClick={(e) => e.stopPropagation()}
                        style={{ zIndex: 1000000 }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-gray-600'}`}>
                                Exercise {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Status'}
                            </h3>
                            <button 
                                onClick={() => setShowDetailsBox(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Exercise: {exerciseName}</h4>
                            <div className={`border rounded p-3 ${
                                isCompleted ? 'bg-green-50 border-green-200' : 
                                isFailed ? 'bg-red-50 border-red-200' : 
                                'bg-gray-50 border-gray-200'
                            }`}>
                                <p className={`text-sm ${
                                    isCompleted ? 'text-green-800' : 
                                    isFailed ? 'text-red-800' : 
                                    'text-gray-800'
                                }`}>
                                    Status: <span className="font-medium capitalize">{exerciseStatus.replace('_', ' ')}</span>
                                </p>
                                {isFailed && status.failure_reason && (
                                    <p className="text-red-800 text-sm mt-2">
                                        <strong>Reason:</strong> {status.failure_reason}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {status.last_updated && (
                            <div className="text-gray-500 text-sm">
                                Last updated: {new Date(status.last_updated).toLocaleString()}
                            </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => setShowDetailsBox(false)}
                                className="px-4 py-2 text-white rounded transition-colors hover:opacity-90"
                                style={{ backgroundColor: 'rgb(255, 56, 92)' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ExerciseStatus;
