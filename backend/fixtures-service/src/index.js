const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const axios = require('axios');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const fixturesRoutes = require('./routes/fixtures');

const app = express();
const PORT = process.env.PORT || 3002;

// Create cache instance - 5 minutes default TTL for fixture data
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
  useClones: false
});

// Make cache available globally
app.locals.cache = cache;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MAIN_SERVICE_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

// Rate limiting - more lenient for fixture service
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// API configuration validation
const requiredEnvVars = ['API_FOOTBALL_KEY', 'API_FOOTBALL_HOST'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cacheStats = cache.getStats();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'fixtures-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    cache: {
      keys: cacheStats.keys,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    uptime: `${Math.round(process.uptime())}s`
  });
});

// Test API connectivity
app.get('/health/api', async (req, res) => {
  try {
    const response = await axios.get(`https://${process.env.API_FOOTBALL_HOST}/status`, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      },
      timeout: 5000
    });

    res.status(200).json({
      status: 'OK',
      apiFootball: {
        connected: true,
        account: response.data.response?.account || {},
        subscription: response.data.response?.subscription || {},
        requests: response.data.response?.requests || {}
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      apiFootball: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Cache management endpoints
app.get('/cache/stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  
  res.json({
    stats,
    keyCount: keys.length,
    keys: keys.slice(0, 10), // Show first 10 keys
    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  });
});

app.delete('/cache/clear', (req, res) => {
  const keyCount = cache.keys().length;
  cache.flushAll();
  
  res.json({
    message: 'Cache cleared successfully',
    clearedKeys: keyCount
  });
});

// Routes
app.use('/fixtures', fixturesRoutes);

// API documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    service: 'Fixtures Service',
    version: '1.0.0',
    description: 'Football fixtures data service powered by API-Football',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /health/api': 'External API connectivity check',
      'GET /cache/stats': 'Cache statistics',
      'DELETE /cache/clear': 'Clear cache',
      'GET /fixtures/live': 'Get live fixtures',
      'GET /fixtures': 'Get fixtures with filters',
      'GET /fixtures/:id': 'Get specific fixture',
      'GET /fixtures/:id/events': 'Get fixture events',
      'GET /fixtures/:id/lineups': 'Get fixture lineups',
      'GET /fixtures/:id/statistics': 'Get fixture statistics'
    },
    rateLimit: '200 requests per 15 minutes',
    cache: 'Enabled with 5 minute TTL',
    dataSource: 'API-Football'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /health/api', 
      'GET /fixtures/live',
      'GET /fixtures',
      'GET /docs'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Clear cache
  cache.flushAll();
  console.log('✅ Cache cleared');
  
  // Exit process
  setTimeout(() => {
    console.log('✅ Fixtures service shutdown complete');
    process.exit(0);
  }, 1000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Fixtures Service Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Key: ${process.env.API_FOOTBALL_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`💾 Cache: Enabled (5min TTL)`);
  console.log(`🛡️  Rate Limit: 200 req/15min`);
  console.log(`📖 Documentation: http://localhost:${PORT}/docs\n`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}); 