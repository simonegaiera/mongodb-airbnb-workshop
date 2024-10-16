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

  useEffect(() => {
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
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

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
      setPropertyData((prev) => ({
        ...prev,
        [name.split('.')[0]]: name.includes('.') 
          ? {
              ...prev[name.split('.')[0]], 
              [name.split('.')[1]]: isNaN(value) ? value : Number(value),
            } 
          : isNaN(value) ? value : Number(value),
      }));
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
    if ( e.key === 'Enter' ) {
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
              <Box component="img" src={propertyData.images?.picture_url} alt={propertyData.name} sx={{ width: '100%', borderRadius: 1, marginBottom: 2 }} />
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
                propertyData.reviews.map((review, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="body2" gutterBottom><strong>{review.reviewer_name}</strong>: {review.comments}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" gutterBottom>No reviews available.</Typography>
              )}
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