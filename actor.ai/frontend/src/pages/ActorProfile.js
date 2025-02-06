import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@material-ui/core';
import { NavigateBefore, NavigateNext } from '@material-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import PhotoUpload from '../components/PhotoUpload';

function ActorProfile() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [actor, setActor] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const response = await axios.get(`/api/actors/${id}`);
        setActor(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch actor details');
        setLoading(false);
      }
    };

    fetchActor();
  }, [id]);

  const handlePhotoAdded = (newPhoto) => {
    setActor(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));
  };

  const handlePhotoDeleted = (photoId) => {
    setActor(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev + 1 >= actor.photos.length ? 0 : prev + 1
    );
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev - 1 < 0 ? actor.photos.length - 1 : prev - 1
    );
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!actor) return <Typography>Actor not found</Typography>;

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            {actor.photos?.length > 0 ? (
              <>
                <CardMedia
                  component="img"
                  height="400"
                  image={actor.photos[currentPhotoIndex].url}
                  alt={actor.name}
                />
                {actor.photos.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                    <IconButton onClick={handlePrevPhoto}>
                      <NavigateBefore />
                    </IconButton>
                    <Typography style={{ margin: 'auto 0' }}>
                      {currentPhotoIndex + 1} / {actor.photos.length}
                    </Typography>
                    <IconButton onClick={handleNextPhoto}>
                      <NavigateNext />
                    </IconButton>
                  </div>
                )}
              </>
            ) : (
              <CardMedia
                component="img"
                height="400"
                image="/placeholder.jpg"
                alt={actor.name}
              />
            )}
          </Card>

          {isAdmin && (
            <div style={{ marginTop: '1rem' }}>
              <PhotoUpload
                actorId={actor.id}
                photos={actor.photos}
                onPhotoAdded={handlePhotoAdded}
                onPhotoDeleted={handlePhotoDeleted}
              />
            </div>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            {actor.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Born: {new Date(actor.birthday).toLocaleDateString()} in {actor.birthplace}
          </Typography>
          <Typography variant="body1" paragraph>
            {actor.bio}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Filmography
          </Typography>
          <List>
            {actor.movies?.map((movie) => (
              <React.Fragment key={movie.id}>
                <ListItem>
                  <ListItemText
                    primary={movie.title}
                    secondary={`Role: ${movie.role}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ActorProfile; 