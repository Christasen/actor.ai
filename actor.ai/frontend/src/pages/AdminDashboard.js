import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Typography,
  Box
} from '@material-ui/core';
import axios from 'axios';
import PhotoUpload from '../components/PhotoUpload';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [actorData, setActorData] = useState({
    name: '',
    birthplace: '',
    birthday: '',
    bio: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedActor, setSelectedActor] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage('');
  };

  const handleInputChange = (e) => {
    setActorData({
      ...actorData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/actors', actorData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage('Actor added successfully!');
      setActorData({ name: '', birthplace: '', birthday: '', bio: '' });
    } catch (error) {
      setMessage('Failed to add actor: ' + error.message);
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await axios.post('/api/admin/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage('PDF processed successfully!');
      setSelectedFile(null);
    } catch (error) {
      setMessage('Failed to process PDF: ' + error.message);
    }
  };

  const handleActorSelect = async (actorId) => {
    try {
      const response = await axios.get(`/api/actors/${actorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedActor(response.data);
    } catch (error) {
      setMessage('Failed to fetch actor details');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Manual Entry" />
          <Tab label="PDF Upload" />
          <Tab label="Photo Management" />
        </Tabs>

        {message && (
          <Typography 
            color={message.includes('Failed') ? 'error' : 'primary'}
            align="center"
            style={{ margin: '1rem' }}
          >
            {message}
          </Typography>
        )}

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleManualSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={actorData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Birthplace"
                  name="birthplace"
                  value={actorData.birthplace}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Birthday"
                  name="birthday"
                  value={actorData.birthday}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Biography"
                  name="bio"
                  value={actorData.bio}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Add Actor
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handlePdfSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={handleFileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!selectedFile}
                >
                  Upload and Process PDF
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Actor"
                value={selectedActor?.id || ''}
                onChange={(e) => handleActorSelect(e.target.value)}
              >
                {/* You'll need to fetch and map actors here */}
              </TextField>
            </Grid>
            {selectedActor && (
              <Grid item xs={12}>
                <PhotoUpload
                  actorId={selectedActor.id}
                  photos={selectedActor.photos}
                  onPhotoAdded={(photo) => {
                    setSelectedActor(prev => ({
                      ...prev,
                      photos: [...prev.photos, photo]
                    }));
                  }}
                  onPhotoDeleted={(photoId) => {
                    setSelectedActor(prev => ({
                      ...prev,
                      photos: prev.photos.filter(p => p.id !== photoId)
                    }));
                  }}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 