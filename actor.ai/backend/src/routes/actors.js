const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { client } = require('../config/elasticsearch');

// Search actors
router.get('/search', async (req, res) => {
  try {
    const { name, birthplace, birthYear, movie } = req.query;
    
    const should = [];
    if (name) should.push({ match: { name: name } });
    if (birthplace) should.push({ match: { birthplace: birthplace } });
    if (birthYear) should.push({ match: { "birthday": birthYear } });
    if (movie) {
      should.push({
        nested: {
          path: "movies",
          query: {
            match: { "movies.title": movie }
          }
        }
      });
    }

    const result = await client.search({
      index: 'actors',
      body: {
        query: {
          bool: { should }
        }
      }
    });

    res.json(result.body.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    })));
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Get actor by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, 
        json_agg(DISTINCT jsonb_build_object('id', m.id, 'title', m.title, 'role', am.role)) as movies,
        json_agg(DISTINCT jsonb_build_object('id', p.id, 'url', p.url)) as photos
      FROM actors a
      LEFT JOIN actor_movies am ON a.id = am.actor_id
      LEFT JOIN movies m ON am.movie_id = m.id
      LEFT JOIN photos p ON a.id = p.actor_id
      WHERE a.id = $1
      GROUP BY a.id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch actor', error: error.message });
  }
});

module.exports = router; 