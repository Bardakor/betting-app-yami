const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const oddsRoutes = require('./routes/odds');
const { initDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize cache with 10 minute TTL
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600 });
app.locals.cache = cache;

// Initialize MongoDB database
const initDB = async () => {
  try {
    const isConnected = await initDatabase();
    if (isConnected) {
      console.log('📊 MongoDB database initialized');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Remove forced in-memory flag and immediately attempt to connect
initDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300 // Limit for odds calculations
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MAIN_SERVICE_URL || 'http://localhost:3001',
    'http://localhost:8000' // API Gateway
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter);
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'odds-service',
    cache_stats: {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses
    }
  });
});

// Root endpoint with service info
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Yami Betting Platform - Odds Service',
    version: '1.0.0',
    description: 'Dynamic odds calculation and management service',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /odds': 'Get all odds',
      'GET /odds/:fixtureId': 'Get odds for specific fixture',
      'POST /odds/calculate': 'Calculate odds for fixture',
      'POST /odds/update': 'Update odds for fixture',
      'GET /odds/live': 'Get live odds updates',
      'GET /cache/stats': 'Cache statistics',
      'DELETE /cache/clear': 'Clear cache'
    },
    features: [
      'Real-time odds calculation',
      'MongoDB database storage',
      'In-memory caching',
      'Live odds updates',
      'In-memory fallback for demo'
    ],
    database: 'MongoDB with in-memory fallback and 10-minute cache TTL',
    cache_stats: {
      keys: req.app.locals.cache.keys().length,
      hits: req.app.locals.cache.getStats().hits,
      misses: req.app.locals.cache.getStats().misses
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/', oddsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    service: 'odds-service'
  });
});

app.listen(PORT, () => {
  console.log(`🎲 Odds service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 