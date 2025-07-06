const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const resultRoutes = require('./routes/results');
const { processFinishedMatches } = require('./services/resultProcessor');

const app = express();
const PORT = process.env.PORT || 3006;

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
    service: 'Elite Betting Platform - Result Service',
    version: '1.0.0',
    description: 'Match result evaluation and bet settlement service',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/results/evaluate': 'Evaluate match results',
      'GET /api/results': 'Get all results',
      'GET /api/results/:fixtureId': 'Get result for specific fixture',
      'POST /api/results/settle': 'Settle bets for finished matches',
      'GET /api/results/stats': 'Get result processing statistics'
    },
    features: [
      'Automatic result evaluation',
      'Bet settlement processing',
      'Scheduled result checking',
      'Result validation and verification'
    ],
    automation: 'Runs every 5 minutes to check finished matches',
    database: 'MongoDB with Result tracking',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/results', resultRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Result Evaluation Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Result Service endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start cron job for automatic result processing
// Run every 5 minutes to check for finished matches
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 Running automatic result processing...');
  try {
    await processFinishedMatches();
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🏁 Result Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🎯 Result API: http://localhost:${PORT}/api/results`);
  console.log(`⏰ Automatic result processing enabled (every 5 minutes)`);
});

module.exports = app; 