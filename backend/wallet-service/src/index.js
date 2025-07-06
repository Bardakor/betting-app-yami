const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const walletRoutes = require('./routes/wallet');

const app = express();
const PORT = process.env.PORT || 3004;

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
    service: 'Yami Betting Platform - Wallet Service',
    version: '1.0.0',
    description: 'User wallet and transaction management service',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /api/wallet/:userId/balance': 'Get user balance',
      'POST /api/wallet/:userId/deposit': 'Deposit funds',
      'POST /api/wallet/:userId/withdraw': 'Withdraw funds',
      'GET /api/wallet/:userId/transactions': 'Get transaction history',
      'POST /api/wallet/:userId/transfer': 'Transfer funds between users',
      'GET /api/wallet/:userId/stats': 'Get wallet statistics'
    },
    features: [
      'Balance management',
      'Transaction processing',
      'Transaction history',
      'Fund transfers',
      'Wallet statistics'
    ],
    database: 'MongoDB with Transaction logging',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Wallet Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Wallet Service endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🏦 Wallet Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Wallet API: http://localhost:${PORT}/api/wallet`);
});

module.exports = app; 