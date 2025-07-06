const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const betRoutes = require('./routes/bets');

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// Root endpoint with service info
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Elite Betting Platform - Bet Service',
    version: '1.0.0',
    description: 'Betting management and processing service',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/bets': 'Place a new bet',
      'GET /api/bets': 'Get all bets (with filters)',
      'GET /api/bets/:id': 'Get specific bet',
      'PUT /api/bets/:id': 'Update bet status',
      'DELETE /api/bets/:id': 'Cancel/delete bet',
      'GET /api/bets/user/:userId': 'Get user bets',
      'GET /api/bets/fixture/:fixtureId': 'Get bets for fixture'
    },
    features: [
      'Bet placement and management',
      'User bet tracking',
      'Fixture-based betting',
      'Real-time bet processing'
    ],
    database: 'MongoDB with Mongoose ODM',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/bets', betRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Bet Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Bet Service endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎯 Bet Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🎲 Bet API: http://localhost:${PORT}/api/bets`);
});

module.exports = app; 