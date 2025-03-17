'use client';

import { Suspense, useEffect, useState } from 'react';

function RoomDetail() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [id, setId] = useState(null);

  useEffect(() => {
    // Get id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    setId(roomId);

    if (roomId) {
      fetch(`${process.env.BASE_URL}/api/listingsAndReviews/${roomId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setRoom(data);
          setEditedTitle(data.name);
          setEditedDescription(data.description);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching room:', error);
          setLoading(false);
        });
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
      console.log(updatedRoom);
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
    console.log('Review submitted:', reviewText);
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
      console.log('Review submitted:', data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
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

      <div className="aspect-w-16 aspect-h-9 mb-8">
        <img 
          src={room.images.picture_url} 
          alt={room.name}
          className="object-cover rounded-lg w-full h-[60vh]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {room.room_type} hosted by {room.host.host_name}
            </h2>
            <div className="flex items-center gap-4">
              <span>{room.accommodates} guests</span>
              <span>·</span>
              <span>{room.bedrooms} bedroom</span>
              <span>·</span>
              <span>{room.beds} bed</span>
              <span>·</span>
              <span>{room.bathrooms.$numberDecimal} baths</span>
            </div>
          </div>
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Meet your host</h3>
            <div className="flex items-center gap-4">
              <img 
                src={room.host.host_picture_url} 
                alt={room.host.host_name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "/hostImageDefault.png";
                  console.log("Error loading image");
                }}
              />
              <div>
                <h4 className="font-semibold text-lg">{room.host.host_name}</h4>
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
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              
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
              {[...room.reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).map((review) => (
                <div key={review._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {review.reviewer_name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.reviewer_name}</h4>
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
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-8 border rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-2xl font-bold">${room.price.$numberDecimal}</span>
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
