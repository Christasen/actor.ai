require('dotenv').config({ path: '.env.test' });
const { pool } = require('../../config/db');
const { client: esClient } = require('../../config/elasticsearch');

beforeAll(async () => {
  // Setup database
  await pool.query(`
    DROP TABLE IF EXISTS photos, actor_movies, movies, actors, users CASCADE;
    
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ... rest of the schema ...
  `);

  // Setup Elasticsearch
  try {
    await esClient.indices.delete({ index: 'actors' });
  } catch (error) {
    // Ignore if index doesn't exist
  }

  await esClient.indices.create({
    index: 'actors',
    body: {
      mappings: {
        properties: {
          name: { type: 'text' },
          birthplace: { type: 'text' },
          birthday: { type: 'date' },
          bio: { type: 'text' }
        }
      }
    }
  });
});

afterAll(async () => {
  await pool.end();
  await esClient.close();
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE photos, actor_movies, movies, actors, users CASCADE');
  await esClient.deleteByQuery({
    index: 'actors',
    body: {
      query: {
        match_all: {}
      }
    },
    refresh: true
  });
}); 