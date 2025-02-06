require('dotenv').config({ path: '.env.test' });
const { pool } = require('../config/db');

beforeAll(async () => {
  // Create test database tables
  await pool.query(`
    DROP TABLE IF EXISTS photos, actor_movies, movies, actors, users CASCADE;
    
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE actors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      birthplace VARCHAR(100),
      birthday DATE,
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ... rest of the schema ...
  `);
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  // Clean up tables after each test
  await pool.query(`
    TRUNCATE TABLE photos, actor_movies, movies, actors, users CASCADE;
  `);
}); 