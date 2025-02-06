import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Grid, Card } from '@material-ui/core';

function SearchPage() {
  const [searchParams, setSearchParams] = useState({
    name: '',
    birthplace: '',
    birthYear: '',
    movie: ''
  });
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/actors/search', { params: searchParams });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="search-page">
      <form onSubmit={handleSearch}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Actor Name"
              value={searchParams.name}
              onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Birthplace"
              value={searchParams.birthplace}
              onChange={(e) => setSearchParams({...searchParams, birthplace: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Birth Year"
              value={searchParams.birthYear}
              onChange={(e) => setSearchParams({...searchParams, birthYear: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Movie"
              value={searchParams.movie}
              onChange={(e) => setSearchParams({...searchParams, movie: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit">
              Search
            </Button>
          </Grid>
        </Grid>
      </form>

      <div className="search-results">
        {results.map(actor => (
          <Card key={actor.id} className="actor-card">
            {/* Actor card content */}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SearchPage; 