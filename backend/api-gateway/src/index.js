const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Service URLs
const services = {
  main: process.env.MAIN_SERVICE_URL || 'http://localhost:3001',
  fixtures: process.env.FIXTURES_SERVICE_URL || 'http://localhost:3002',
  odds: process.env.ODDS_SERVICE_URL || 'http://localhost:3003',
  wallet: process.env.WALLET_SERVICE_URL || 'http://localhost:3004',
  bet: process.env.BET_SERVICE_URL || 'http://localhost:3005',
  result: process.env.RESULT_SERVICE_URL || 'http://localhost:3006'
};

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'Elite Betting Platform API',
      version: process.env.API_VERSION || '1.0.0',
      description: process.env.API_DESCRIPTION || 'Comprehensive API Gateway for Elite Betting Platform microservices',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
  },
  apis: ['./src/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    gateway: 'API Gateway',
    services: Object.keys(services)
  });
});

// Service health checks
app.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        return { name, status: 'healthy', url, response: response.data };
      } catch (error) {
        return { name, status: 'unhealthy', url, error: error.message };
      }
    })
  );

  const results = healthChecks.map(result => result.value);
  const allHealthy = results.every(service => service.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    gateway: 'healthy',
    services: results,
    timestamp: new Date().toISOString()
  });
});

// API Testing endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Elite Betting Platform API Gateway is running!',
    timestamp: new Date().toISOString(),
    availableServices: Object.keys(services),
    endpoints: {
      health: '/health',
      serviceHealth: '/health/services',
      docs: '/docs',
      test: '/test'
    }
  });
});

// API Testing redirect
app.get('/test-interface', (req, res) => {
  res.json({
    message: 'API Test Interface available in the frontend',
    redirectTo: 'http://localhost:3000/api-test',
    documentation: 'http://localhost:3000/docs',
    swagger: '/docs',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Authentication endpoint
 *     description: Proxy to main service for authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 */
// Proxy to Main Service (Authentication, Users)
app.use('/api/auth', createProxyMiddleware({
  target: services.main,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Main Service proxy error:', err.message);
    res.status(503).json({ error: 'Main service unavailable' });
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.main,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('Main Service proxy error:', err.message);
    res.status(503).json({ error: 'Main service unavailable' });
  }
}));

/**
 * @swagger
 * /api/fixtures:
 *   get:
 *     summary: Get fixtures
 *     description: Proxy to fixtures service
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: List of fixtures
 */
// Proxy to Fixtures Service
app.use('/api/fixtures', createProxyMiddleware({
  target: `${services.fixtures}/fixtures`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/fixtures': ''
  },
  onError: (err, req, res) => {
    console.error('Fixtures Service proxy error:', err.message);
    res.status(503).json({ error: 'Fixtures service unavailable' });
  }
}));

/**
 * @swagger
 * /api/odds:
 *   get:
 *     summary: Get odds
 *     description: Proxy to odds service
 *     tags: [Odds]
 *     responses:
 *       200:
 *         description: List of odds
 */
// Proxy to Odds Service
app.use('/api/odds', createProxyMiddleware({
  target: services.odds,
  changeOrigin: true,
  pathRewrite: {
    '^/api/odds': ''
  },
  onError: (err, req, res) => {
    console.error('Odds Service proxy error:', err.message);
    res.status(503).json({ error: 'Odds service unavailable' });
  }
}));

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get wallet information
 *     description: Proxy to wallet service
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Wallet information
 */
// Proxy to Wallet Service
app.use('/api/wallet', createProxyMiddleware({
  target: services.wallet,
  changeOrigin: true,
  pathRewrite: {
    '^/api/wallet': '/api/wallet'
  },
  onError: (err, req, res) => {
    console.error('Wallet Service proxy error:', err.message);
    res.status(503).json({ error: 'Wallet service unavailable' });
  }
}));

/**
 * @swagger
 * /api/bets:
 *   get:
 *     summary: Get bets
 *     description: Proxy to bet service
 *     tags: [Bets]
 *     responses:
 *       200:
 *         description: List of bets
 */
// Proxy to Bet Service
app.use('/api/bets', createProxyMiddleware({
  target: `${services.bet}/api/bets`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/bets': ''
  },
  onError: (err, req, res) => {
    console.error('Bet Service proxy error:', err.message);
    res.status(503).json({ error: 'Bet service unavailable' });
  }
}));

/**
 * @swagger
 * /api/results:
 *   get:
 *     summary: Get results
 *     description: Proxy to result service
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: List of results
 */
// Proxy to Result Service
app.use('/api/results', createProxyMiddleware({
  target: `${services.result}/api/results`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/results': ''
  },
  onError: (err, req, res) => {
    console.error('Result Service proxy error:', err.message);
    res.status(503).json({ error: 'Result service unavailable' });
  }
}));

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'Please check the API documentation at /docs',
    availableEndpoints: [
      '/health',
      '/health/services',
      '/docs',
      '/test',
      '/api/auth',
      '/api/users',
      '/api/fixtures',
      '/api/odds',
      '/api/wallet',
      '/api/bets',
      '/api/results'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong in the API Gateway'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/test`);
  console.log(`⚡ Services Coordinated: ${Object.keys(services).join(', ')}`);
});
