import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

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
    const key = name.includes('.') ? name.split('.')[1] : name;
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
    <Box display="flex" alignItems="center" marginBottom={2}>
      {editField === name ? (
        <>
          <TextField
            name={name}
            label={label}
            value={tempValue}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, name)}
            type={type}
            fullWidth
            margin="normal"
          />
          <IconButton onClick={() => handleSubmit(name, tempValue)}>
            <CheckIcon />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>{label}: {value}</Typography>
          <IconButton onClick={() => handleEditToggle(name, value)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </Box>
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
      await fetchPropertyData(); // Refresh property data after new review is added
      setNewReview({ reviewer_name: '', comments: '' }); // Reset the review form
    } catch (err) {
      console.error("Failed to submit review:", err); // Log error to console
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMoreReviews = () => {
    setReviewsToShow((prev) => prev + 5);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Property Details</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : error || !propertyData ? (
          <Typography variant="h6" color="error">Failed to load property data</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              {renderField('Name', 'name', propertyData.name || '')}
              <Box 
                component="img" 
                src={propertyData.images?.picture_url} 
                alt={propertyData.name} 
                sx={{ 
                  maxHeight: 250, // Set max-height to keep it small 
                  objectFit: 'contain', // Maintain aspect ratio
                  borderRadius: 1, 
                  marginBottom: 2 
                }} 
              />
              {renderField('Street', 'address.street', propertyData.address?.street || '')}
              {renderField('City', 'address.city', propertyData.address?.city || '')}
              {renderField('Host Name', 'host.host_name', propertyData.host?.host_name || '')}
              {renderField('Accommodates', 'accommodates', propertyData.accommodates || '', 'number')}
              {renderField('Bedrooms', 'bedrooms', propertyData.bedrooms || '', 'number')}
              {renderField('Beds', 'beds', propertyData.beds || '', 'number')}
              {renderField('Property Type', 'property_type', propertyData.property_type || '')}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Reviews</Typography>
              {propertyData.reviews && propertyData.reviews.length > 0 ? (
                propertyData.reviews.slice(0, reviewsToShow).map((review, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="body2" gutterBottom><strong>{review.reviewer_name}</strong>: {review.comments}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" gutterBottom>No reviews available.</Typography>
              )}
              {propertyData.reviews && propertyData.reviews.length > reviewsToShow && (
                <Button onClick={showMoreReviews}>Add More</Button>
              )}
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Add a Review</Typography>
                <TextField
                  name="reviewer_name"
                  label="Reviewer Name"
                  value={newReview.reviewer_name}
                  onChange={handleReviewInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="comments"
                  label="Comment"
                  value={newReview.comments}
                  onChange={handleReviewInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
                <Button 
                  onClick={handleReviewSubmit} 
                  color="primary" 
                  variant="contained" 
                  disabled={isSubmitting}
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyDialog;