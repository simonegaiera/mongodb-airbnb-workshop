'use client';

import { Suspense, useEffect, useState } from 'react';
import ExerciseStatus from '../../components/ExerciseStatus';

function RoomDetail() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [id, setId] = useState(null);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 5;
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    // Get id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    setId(roomId);

    if (roomId) {
      const fetchRoomData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${roomId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          setRoom(data);
          setEditedTitle(data.name);
          setEditedDescription(data.description);
        } catch (error) {
          console.error('Error fetching room data:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchRoomData();
    }
  }, []);

  const handleTitleSave = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key:"name",
          value:  editedTitle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      const updatedRoom = await response.json();
      // console.log(updatedRoom);
      setRoom(prev => ({...prev, name: editedTitle}));
      setEditingTitle(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDescriptionSave = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key:"description",
          value: editedDescription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update description');
      }

      const updatedRoom = await response.json();
      setRoom(prev => ({...prev, description: editedDescription}));
      setEditingDescription(false);
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleSubmitReview = () => {
    // console.log('Review submitted:', reviewText);
    setReviewText('');
    setShowCommentBox(false);
    fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: {
          id: id
        },
        reviewer_name: "anonymous",
        _id: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        listing_id: id,
        comments: reviewText,
        date: new Date().toISOString()
      }),
    })
    .then(response => response.json())
    .then(data => {
      // console.log('Review submitted:', data);
      // Fetch updated room data to refresh reviews
      fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`)
        .then(response => response.json())
        .then(roomData => {
          setRoom(roomData);
        })
        .catch(error => {
          console.error('Error fetching updated room:', error);
        });
    })
    .catch(error => {
      console.error('Error submitting review:', error);
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        
        const response = await fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete listing');
        }

        // Redirect to home page after successful deletion
        window.location.href = `${process.env.BASE_PATH}/`;
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
    }
  };

  // Calculate pagination for reviews
  const reviews = Array.isArray(room?.reviews) ? room.reviews : [];
  const totalReviews = reviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentReviewPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  // Sort reviews by date (newest first) before slicing for pagination
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentReviews = sortedReviews.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentReviewPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentReviewPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">        
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading room details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        {/* Exercise Status for crud-2 */}
        <div className="px-4 py-2 mb-2">
          <ExerciseStatus exerciseName="crud-2" />
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <h3 className="text-red-800 font-medium">Unable to load room details</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">
            Error: {error}
          </p>
          <p className="text-red-600 text-xs mt-2">
            This might indicate that the room API endpoint is not implemented or the server is not running.
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        {/* Exercise Status for crud-2 */}
        <div className="px-4 py-2 mb-2">
          <ExerciseStatus exerciseName="crud-2" />
        </div>
        
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-gray-600">Room not found</h2>
          <p className="text-gray-500 mt-2">The requested room could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
      {/* Exercise Status - Horizontal Layout */}
      <div className="flex flex-wrap gap-4 px-4 py-4">
        <ExerciseStatus exerciseName="crud-2" />
        <ExerciseStatus exerciseName="crud-6" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        {editingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-3xl font-bold px-2 py-1 border rounded"
            />
            <button onClick={handleTitleSave} className="text-sm text-gray-600 hover:text-gray-900">
              Save
            </button>
            <button onClick={() => setEditingTitle(false)} className="text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <button 
              onClick={() => setEditingTitle(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✎
            </button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{room.review_scores?.review_scores_rating / 20 || 'New'}</span>
        </div>
        <span>·</span>
        <span>{room.reviews?.length || 0} reviews</span>
        <span>·</span>
        <span>{room.address?.suburb}, {room.address?.country}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Property Image */}
          <div className="mb-6">
            <img 
              src={room?.images?.picture_url || '/defaultImage.png'} 
              alt={room.name}
              className="object-cover rounded-lg w-full h-[40vh] md:h-[45vh]"
            />
          </div>

          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {room.room_type} hosted by {room.host?.host_name || 'Unknown Host'}
            </h2>
            <div className="flex items-center gap-4">
              <span>{room.accommodates} guests</span>
              <span>·</span>
              <span>{room.bedrooms} bedroom</span>
              <span>·</span>
              <span>{room.beds} bed</span>
              <span>{room.bathrooms?.$numberDecimal || room.bathrooms || 'N/A'} baths</span>
            </div>
          </div>
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Meet your host</h3>
            <div className="flex items-center gap-4">
              <img 
                src={room.host?.host_picture_url || '/hostImageDefault.jpg'} 
                alt={room.host?.host_name || 'Host image'}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `${process.env.BASE_PATH}/hostImageDefault.jpg`;
                  // console.log("Error loading image");
                }}
              />
              <div>
                <h4 className="font-semibold text-lg">{room.host?.host_name || 'Unknown Host'}</h4>
              </div>
            </div>
          </div>

          <div className="border-b pb-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-semibold">About this space</h3>
              <button 
                onClick={() => setEditingDescription(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✎
              </button>
            </div>
            {editingDescription ? (
              <div>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-600"
                  rows="4"
                />
                <div className="mt-2">
                  <button onClick={handleDescriptionSave} className="text-sm text-gray-600 hover:text-gray-900 mr-2">
                    Save
                  </button>
                  <button onClick={() => setEditingDescription(false)} className="text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{room.description}</p>
            )}
          </div>

          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
              {room.amenities
                ?.slice(0, showAllAmenities ? room.amenities.length : 10)
                .map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <span>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
            </div>
            {room.amenities && room.amenities.length > 10 && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 text-gray-600 hover:text-gray-900 font-medium underline"
              >
                {showAllAmenities ? 'Show less' : `Show all ${room.amenities.length} amenities`}
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reviews ({totalReviews})</h3>
              {totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  Page {currentReviewPage} of {totalPages}
                </div>
              )}
            </div>

            <div className="px-4 py-2 mb-2">
              <ExerciseStatus exerciseName="crud-7" />
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">              
              <div key="add-review" className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3" onClick={() => setShowCommentBox(!showCommentBox)}>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-2xl font-semibold text-gray-600">+</span>
                  </div>
                  <div className="cursor-pointer">
                    <h4 className="font-semibold">Add a review</h4>
                  </div>
                </div>
                {showCommentBox && (
                  <div className="mt-4">
                    <textarea 
                      className="w-full p-2 border rounded-lg" 
                      placeholder="Write your review here..."
                      rows="4"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <button className="mt-2 bg-[#FF385C] text-white px-4 py-2 rounded-lg" onClick={handleSubmitReview}>
                      Submit
                    </button>
                  </div>
                )}
              </div> 
              {currentReviews
                .map((review) => (
                <div key={review._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {review.reviewer_name ? review.reviewer_name[0] : '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.reviewer_name || 'Anonymous'}</h4>
                      <div className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <p className="line-clamp-4">{review.comments}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      Review ID: {review._id}
                      {review.listing_id && <span> • Listing: {review.listing_id}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 flex-wrap">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentReviewPage === 1}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    currentReviewPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {(() => {
                    const maxVisiblePages = 5;
                    const pages = [];
                    let startPage, endPage;

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      startPage = 1;
                      endPage = totalPages;
                    } else {
                      // Calculate range around current page
                      const halfVisible = Math.floor(maxVisiblePages / 2);
                      
                      if (currentReviewPage <= halfVisible + 1) {
                        // Near the beginning
                        startPage = 1;
                        endPage = maxVisiblePages;
                      } else if (currentReviewPage >= totalPages - halfVisible) {
                        // Near the end
                        startPage = totalPages - maxVisiblePages + 1;
                        endPage = totalPages;
                      } else {
                        // In the middle
                        startPage = currentReviewPage - halfVisible;
                        endPage = currentReviewPage + halfVisible;
                      }
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentReviewPage(1)}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }

                    // Add visible pages
                    for (let page = startPage; page <= endPage; page++) {
                      pages.push(
                        <button
                          key={page}
                          onClick={() => setCurrentReviewPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            page === currentReviewPage
                              ? 'bg-[#FF385C] text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }

                    // Add ellipsis and last page if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentReviewPage(totalPages)}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentReviewPage === totalPages}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    currentReviewPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 border rounded-xl p-6 shadow-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-2xl font-bold">
                  ${room.price?.$numberDecimal || room.price || 'N/A'}
                </span>
                <span className="text-gray-500"> / night</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{room.review_scores?.review_scores_rating / 20 || 'New'}</span>
              </div>
            </div>

            <button className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold hover:bg-[#FF385C]/90 transition-colors">
              Reserve
            </button>

            <div className="mt-4 text-center text-gray-500 text-sm">
              You won't be charged yet
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="px-4 py-2 mb-2">
          <ExerciseStatus exerciseName="crud-8" />
        </div>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Delete Listing
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <RoomDetail />
    </Suspense>
  );
}
