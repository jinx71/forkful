require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB, isConnected } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');
const shoppingListRoutes = require('./routes/shoppingList');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['X-Cache', 'X-Cache-TTL', 'X-Data-Source'],
  })
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Global limiter — generous, our backend cache absorbs most upstream calls.
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests', errors: [] },
  })
);

app.get('/api/health', (req, res) =>
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      db: isConnected() ? 'connected' : 'disconnected',
      time: new Date().toISOString(),
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[forkful] api listening on :${PORT}`);
    console.log(`[forkful] cors origin: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
  });
};

start().catch((err) => {
  console.error('[forkful] failed to start:', err);
  process.exit(1);
});

module.exports = app;
