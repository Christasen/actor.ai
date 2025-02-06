import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Grid,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardActions
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import axios from 'axios';

function PhotoUpload({ actorId, photos, onPhotoAdded, onPhotoDeleted }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    setError('');

    try {
      const response = await axios.post(
        `/api/admin/actors/${actorId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      onPhotoAdded(response.data);
    } catch (error) {
      setError('Failed to upload photo');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    try {
      await axios.delete(`/api/admin/actors/${actorId}/photos/${photoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      onPhotoDeleted(photoId);
    } catch (error) {
      setError('Failed to delete photo');
      console.error('Delete error:', error);
    }
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              color="primary"
              component="span"
              startIcon={<AddIcon />}
              disabled={uploading}
            >
              Add Photo
            </Button>
          </label>
          {uploading && <CircularProgress size={24} style={{ marginLeft: 10 }} />}
          {error && (
            <Typography color="error" style={{ marginTop: 10 }}>
              {error}
            </Typography>
          )}
        </Grid>

        {photos?.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={photo.url}
                alt="Actor photo"
              />
              <CardActions>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => handleDelete(photo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default PhotoUpload; 