require('dotenv').config();
const express = require('express');
const cors = require('cors');
const actorRoutes = require('./routes/actors');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/actors', actorRoutes);

// Protected admin routes
app.use('/api/admin', authMiddleware, adminRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 