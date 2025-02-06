const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const createTestUser = async (isAdmin = false) => {
  const { rows } = await pool.query(
    'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING *',
    ['testuser', 'hashedpassword', isAdmin]
  );
  
  const token = jwt.sign(
    { userId: rows[0].id, isAdmin },
    process.env.JWT_SECRET
  );

  return { user: rows[0], token };
};

const createTestActor = async () => {
  const { rows } = await pool.query(
    'INSERT INTO actors (name, birthplace, birthday, bio) VALUES ($1, $2, $3, $4) RETURNING *',
    ['Test Actor', 'Test City', '1990-01-01', 'Test bio']
  );
  return rows[0];
};

module.exports = {
  createTestUser,
  createTestActor
}; 