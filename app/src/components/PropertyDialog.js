import React, { useState, useEffect } from 'react';
import { X, Edit, Check } from 'lucide-react';

const PropertyDialog = ({ id, open, onClose }) => {
    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [editField, setEditField] = useState(null);
    const [tempValue, setTempValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({
        reviewer_name: '',
        comments: ''
    });
    const [reviewsToShow, setReviewsToShow] = useState(5);
    
    const fetchPropertyData = async () => {
        if (id && open) {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPropertyData(data);
                setReviewsToShow(5); // Reset the review count on opening
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
    };
    
    useEffect(() => {
        fetchPropertyData();
    }, [id, open]);
    
    const handleInputChange = (e) => {
        setTempValue(e.target.value);
    };
    
    const handleSubmit = async (name, value) => {
        setIsSubmitting(true);
        const key = name;
        const updateData = { key, value: isNaN(value) ? value : Number(value) };
        
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchPropertyData(); // Refresh property data after successful update
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            setEditField(null); // Exit edit mode
        }
    };
    
    const handleEditToggle = (field, value) => {
        setEditField((prev) => (prev === field ? null : field));
        setTempValue(value);
    };
    
    const handleKeyDown = (e, name) => {
        if (e.key === 'Enter') {
            handleSubmit(name, tempValue);
        }
    };
    
    const renderField = (label, name, value, type = "text") => (
        <div className="flex items-center mb-4">
            {editField === name ? (
                <>
                    <input
                        name={name}
                        placeholder={label}
                        value={tempValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleKeyDown(e, name)}
                        type={type}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={() => handleSubmit(name, tempValue)}
                        className="ml-2 p-2 text-gray-600 hover:text-gray-900"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <>
                    <p className="flex-grow text-sm">{label}: {value}</p>
                    <button 
                        onClick={() => handleEditToggle(name, value)}
                        className="ml-2 p-2 text-gray-600 hover:text-gray-900"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    );
    
    const handleReviewInputChange = (e) => {
        const { name, value } = e.target;
        setNewReview((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleReviewSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReview),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await fetchPropertyData();
            setNewReview({ reviewer_name: '', comments: '' });
        } catch (err) {
            console.error("Failed to submit review:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const showMoreReviews = () => {
        setReviewsToShow((prev) => prev + 5);
    };
    
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-semibold">Property Details</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-600 hover:text-gray-900"
                            disabled={isSubmitting}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : error || !propertyData ? (
                            <p className="text-red-600 text-lg">Failed to load property data</p>
                        ) : (
                            <div className="flex gap-8">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-6">{propertyData.name || ''}</h3>
                                    <img 
                                        src={propertyData.images?.picture_url} 
                                        alt={propertyData.name}
                                        className="max-h-[250px] object-contain rounded mb-4"
                                    />
                                    {renderField('Street', 'address.street', propertyData.address?.street || '')}
                                    {renderField('City', 'address.city', propertyData.address?.city || '')}
                                    {renderField('Host Name', 'host.host_name', propertyData.host?.host_name || '')}
                                    
                                    <p className="my-4 text-sm">Accommodates: {propertyData.accommodates || ''}</p>
                                    <p className="my-4 text-sm">Bedrooms: {propertyData.bedrooms || ''}</p>
                                    <p className="my-4 text-sm">Beds: {propertyData.beds || ''}</p>
                                    <p className="mb-4 text-sm">Property Type: {propertyData.property_type || ''}</p>
                                </div>
                                
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold mb-4">Reviews: {propertyData.number_of_reviews || ''}</h4>
                                    {propertyData.reviews && propertyData.reviews.length > 0 ? (
                                        propertyData.reviews.slice(0, reviewsToShow).map((review, index) => (
                                            <div key={index} className="mb-4">
                                                <p className="text-sm">
                                                    <strong>{review.reviewer_name}</strong>: {review.comments}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm mb-4">No reviews available.</p>
                                    )}
                                    {propertyData.reviews && propertyData.reviews.length > reviewsToShow && (
                                        <button 
                                            onClick={showMoreReviews}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Show More
                                        </button>
                                    )}
                                    
                                    <div className="mt-8">
                                        <h4 className="text-lg font-semibold mb-4">Add a Review</h4>
                                        <input
                                            name="reviewer_name"
                                            placeholder="Reviewer Name"
                                            value={newReview.reviewer_name}
                                            onChange={handleReviewInputChange}
                                            className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <textarea
                                            name="comments"
                                            placeholder="Comment"
                                            value={newReview.comments}
                                            onChange={handleReviewInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button 
                                            onClick={handleReviewSubmit} 
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDialog;