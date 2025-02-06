const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');
const { client } = require('../config/elasticsearch');
const PDFParser = require('../services/pdfParser');
const fileStorage = require('../services/fileStorage');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add actor manually
router.post('/actors', async (req, res) => {
  try {
    const { name, birthplace, birthday, bio, movies } = req.body;

    const { rows } = await db.query(
      'INSERT INTO actors (name, birthplace, birthday, bio) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, birthplace, birthday, bio]
    );

    const actor = rows[0];

    // Index in Elasticsearch
    await client.index({
      index: 'actors',
      id: actor.id.toString(),
      body: {
        name,
        birthplace,
        birthday,
        bio,
        movies: movies || []
      }
    });

    res.status(201).json(actor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create actor', error: error.message });
  }
});

// Upload and process PDF
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    // Extract actor information from PDF
    const actorInfo = await PDFParser.extractActorInfo(req.file.buffer);

    // Start a database transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert actor
      const { rows: [actor] } = await client.query(
        'INSERT INTO actors (name, birthplace, birthday, bio) VALUES ($1, $2, $3, $4) RETURNING id',
        [actorInfo.name, actorInfo.birthplace, actorInfo.birthday, actorInfo.bio]
      );

      // Insert movies and create actor-movie relationships
      for (const movie of actorInfo.movies) {
        // Check if movie exists or insert new one
        const { rows: [movieRow] } = await client.query(
          'INSERT INTO movies (title) VALUES ($1) ON CONFLICT (title) DO UPDATE SET title = EXCLUDED.title RETURNING id',
          [movie.title]
        );

        // Create actor-movie relationship
        await client.query(
          'INSERT INTO actor_movies (actor_id, movie_id, role) VALUES ($1, $2, $3)',
          [actor.id, movieRow.id, movie.role]
        );
      }

      // Index in Elasticsearch
      await client.index({
        index: 'actors',
        id: actor.id.toString(),
        body: {
          name: actorInfo.name,
          birthplace: actorInfo.birthplace,
          birthday: actorInfo.birthday,
          bio: actorInfo.bio,
          movies: actorInfo.movies
        }
      });

      await client.query('COMMIT');
      res.status(201).json({ 
        message: 'Actor information processed successfully',
        actor: { id: actor.id, ...actorInfo }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to process PDF', 
      error: error.message 
    });
  }
});

// Add photo upload endpoint
router.post('/actors/:id/photos', fileStorage.getUploader().single('photo'), async (req, res) => {
  try {
    const actorId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    // Optimize and upload the photo
    const photoUrl = await fileStorage.optimizeAndUpload(req.file);

    // Save photo URL to database
    const { rows } = await db.query(
      'INSERT INTO photos (actor_id, url) VALUES ($1, $2) RETURNING *',
      [actorId, photoUrl]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to upload photo', 
      error: error.message 
    });
  }
});

// Delete photo endpoint
router.delete('/actors/:actorId/photos/:photoId', async (req, res) => {
  const { actorId, photoId } = req.params;

  try {
    // Get photo URL before deletion
    const { rows } = await db.query(
      'SELECT url FROM photos WHERE id = $1 AND actor_id = $2',
      [photoId, actorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete from storage
    await fileStorage.deleteFile(rows[0].url);

    // Delete from database
    await db.query(
      'DELETE FROM photos WHERE id = $1 AND actor_id = $2',
      [photoId, actorId]
    );

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete photo', 
      error: error.message 
    });
  }
});

module.exports = router; 