const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
require('dotenv').config();

const { connectDB } = require('./config/database');
// const passport = require('./config/passport'); // Temporarily disabled
const authRoutes = require('./routes/auth-simple');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Auto-create admin user for demo
setTimeout(async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.success) {
      console.log('🔑 Admin user auto-created for demo');
    }
  } catch (error) {
    // Admin might already exist, ignore error
  }
}, 2000); // Wait 2 seconds for server to be ready

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware (temporarily disabled)
// app.use(passport.initialize());
// app.use(passport.session());

// Logging middleware
app.use(requestLogger);

// Root endpoint with service info
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Elite Betting Platform - Main Service',
    version: '1.0.0',
    description: 'Main authentication and user management service',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /auth/login': 'User login',
      'POST /auth/register': 'User registration',
      'POST /auth/google/callback': 'Google OAuth callback',
      'GET /auth/profile': 'Get user profile',
      'GET /auth/verify-token': 'Verify JWT token',
      'POST /auth/update-balance': 'Update user balance',
      'GET /api/users': 'Get all users (admin)',
      'POST /api/admin/create': 'Create admin user',
      'GET /api/stats': 'Get platform statistics'
    },
    documentation: 'See API_DOCUMENTATION.md for detailed usage',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'main-service',
    version: '1.0.0'
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Main service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 