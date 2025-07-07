require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const fixtureRoutes = require('./routes/fixtures');
const Fixture = require('./models/Fixture');

const app = express();
const PORT = process.env.FIXTURES_SERVICE_PORT || 3003;

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(',');
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/fixtures', fixtureRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mini Betting Platform - Fixtures Service',
    service: 'fixtures-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      fixtures: '/api/fixtures',
      refresh: '/api/fixtures/refresh',
      leagues: '/api/fixtures/leagues',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'fixtures-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    service: 'fixtures-service',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(error.status || 500).json({
    success: false,
    message,
    service: 'fixtures-service',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Initialize sample data on startup
async function initializeSampleData() {
  try {
    const count = await Fixture.countDocuments();
    
    if (count === 0) {
      console.log('No fixtures found, creating sample data...');
      
      const sampleFixtures = [
        {
          externalId: 'sample-1',
          homeTeam: 'Arsenal',
          awayTeam: 'Chelsea',
          league: 'Premier League',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'upcoming',
          odds: { home: 2.1, draw: 3.4, away: 2.8 },
          venue: { name: 'Emirates Stadium', city: 'London' }
        },
        {
          externalId: 'sample-2',
          homeTeam: 'Liverpool',
          awayTeam: 'Manchester United',
          league: 'Premier League',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          status: 'upcoming',
          odds: { home: 1.8, draw: 3.6, away: 3.2 },
          venue: { name: 'Anfield', city: 'Liverpool' }
        },
        {
          externalId: 'sample-3',
          homeTeam: 'Manchester City',
          awayTeam: 'Tottenham',
          league: 'Premier League',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          odds: { home: 1.6, draw: 4.0, away: 4.5 },
          venue: { name: 'Etihad Stadium', city: 'Manchester' }
        },
        {
          externalId: 'sample-4',
          homeTeam: 'Real Madrid',
          awayTeam: 'Barcelona',
          league: 'La Liga',
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          odds: { home: 2.2, draw: 3.1, away: 2.9 },
          venue: { name: 'Santiago Bernabéu', city: 'Madrid' }
        },
        {
          externalId: 'sample-5',
          homeTeam: 'Bayern Munich',
          awayTeam: 'Borussia Dortmund',
          league: 'Bundesliga',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (finished)
          status: 'finished',
          homeScore: 2,
          awayScore: 1,
          odds: { home: 1.7, draw: 3.8, away: 3.5 },
          venue: { name: 'Allianz Arena', city: 'Munich' }
        }
      ];

      await Fixture.insertMany(sampleFixtures);
      console.log(`Created ${sampleFixtures.length} sample fixtures`);
    } else {
      console.log(`Found ${count} existing fixtures`);
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

const server = app.listen(PORT, async () => {
  console.log(`⚽ Fixtures Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize sample data
  await initializeSampleData();
});

module.exports = app;
