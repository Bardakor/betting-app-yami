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
      description: 'Comprehensive API Gateway for Elite Betting Platform microservices. This API provides access to all betting platform functionality including user authentication, fixture data, odds calculation, wallet management, bet placement, and result processing.',
      contact: {
        name: 'Elite Betting Platform',
        email: 'api@elitebetting.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      },
      {
        url: 'https://api.elitebetting.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_1234567890_abc123def' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            fullName: { type: 'string', example: 'John Doe' },
            balance: { type: 'number', format: 'float', example: 1000.50 },
            isActive: { type: 'boolean', example: true },
            stats: {
              type: 'object',
              properties: {
                totalBets: { type: 'integer', example: 5 },
                wonBets: { type: 'integer', example: 2 },
                lostBets: { type: 'integer', example: 2 },
                pendingBets: { type: 'integer', example: 1 },
                totalWinnings: { type: 'number', format: 'float', example: 250.00 },
                totalLosses: { type: 'number', format: 'float', example: 150.00 }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'newuser@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        Fixture: {
          type: 'object',
          properties: {
            fixture: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 868549 },
                date: { type: 'string', format: 'date-time', example: '2024-01-20T15:00:00Z' },
                status: {
                  type: 'object',
                  properties: {
                    long: { type: 'string', example: 'Not Started' },
                    short: { type: 'string', example: 'NS' },
                    elapsed: { type: 'integer', nullable: true, example: null }
                  }
                }
              }
            },
            teams: {
              type: 'object',
              properties: {
                home: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 42 },
                    name: { type: 'string', example: 'Arsenal' },
                    logo: { type: 'string', example: 'https://media.api-sports.io/football/teams/42.png' }
                  }
                },
                away: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 49 },
                    name: { type: 'string', example: 'Chelsea' },
                    logo: { type: 'string', example: 'https://media.api-sports.io/football/teams/49.png' }
                  }
                }
              }
            },
            league: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 9 },
                name: { type: 'string', example: 'Premier League' },
                country: { type: 'string', example: 'England' }
              }
            }
          }
        },
        Odds: {
          type: 'object',
          properties: {
            homeTeam: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Arsenal' },
                odds: { type: 'number', format: 'float', example: 2.15 },
                probability: { type: 'number', format: 'float', example: 46.5 }
              }
            },
            awayTeam: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Chelsea' },
                odds: { type: 'number', format: 'float', example: 3.40 },
                probability: { type: 'number', format: 'float', example: 29.4 }
              }
            },
            draw: {
              type: 'object',
              properties: {
                odds: { type: 'number', format: 'float', example: 3.20 },
                probability: { type: 'number', format: 'float', example: 24.1 }
              }
            }
          }
        },
        BetRequest: {
          type: 'object',
          required: ['fixtureId', 'betType', 'selection', 'stake', 'odds'],
          properties: {
            fixtureId: { type: 'integer', example: 868549 },
            betType: { type: 'string', enum: ['match_winner', 'over_under', 'both_teams_score'], example: 'match_winner' },
            selection: { type: 'string', example: 'home' },
            stake: { type: 'number', format: 'float', minimum: 1, maximum: 10000, example: 25.00 },
            odds: { type: 'number', format: 'float', minimum: 1.01, example: 2.15 }
          }
        },
        Bet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'bet_1234567890_xyz789' },
            fixtureId: { type: 'integer', example: 868549 },
            betType: { type: 'string', example: 'match_winner' },
            selection: { type: 'string', example: 'home' },
            stake: { type: 'number', format: 'float', example: 25.00 },
            odds: { type: 'number', format: 'float', example: 2.15 },
            potentialWin: { type: 'number', format: 'float', example: 53.75 },
            status: { type: 'string', enum: ['active', 'won', 'lost', 'cancelled'], example: 'active' },
            placedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        WalletBalance: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            balance: { type: 'number', format: 'float', example: 1250.50 },
            currency: { type: 'string', example: 'USD' }
          }
        },
        DepositRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', format: 'float', minimum: 1, maximum: 10000, example: 100.00 },
            paymentMethod: { type: 'string', enum: ['credit_card', 'bank_transfer', 'paypal'], example: 'credit_card' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            code: { type: 'string', example: 'ERROR_CODE' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Fixtures',
        description: 'Football fixture data and match information'
      },
      {
        name: 'Odds',
        description: 'Odds calculation and betting markets'
      },
      {
        name: 'Wallet',
        description: 'Wallet management and financial transactions'
      },
      {
        name: 'Bets',
        description: 'Bet placement and management'
      },
      {
        name: 'Results',
        description: 'Match results and bet settlement'
      },
      {
        name: 'System',
        description: 'System health and monitoring endpoints'
      }
    ]
  },
  apis: ['./src/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Gateway Health Check
 *     description: Check the health status of the API Gateway
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Gateway is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 gateway:
 *                   type: string
 *                   example: "API Gateway"
 *                 services:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["main", "fixtures", "odds", "wallet", "bet", "result"]
 * 
 * /health/services:
 *   get:
 *     summary: All Services Health Check
 *     description: Check the health status of all microservices
 *     tags: [System]
 *     responses:
 *       200:
 *         description: All services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gateway:
 *                   type: string
 *                   example: "healthy"
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "main"
 *                       status:
 *                         type: string
 *                         example: "healthy"
 *                       url:
 *                         type: string
 *                         example: "http://localhost:3001"
 *                       response:
 *                         type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: One or more services are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /test:
 *   get:
 *     summary: API Test Endpoint
 *     description: Test endpoint to verify API Gateway is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API Gateway is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Elite Betting Platform API Gateway is running!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 availableServices:
 *                   type: array
 *                   items:
 *                     type: string
 *                 endpoints:
 *                   type: object
 */

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
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/auth/register:
 *   post:
 *     summary: User Registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "newuser@example.com"
 *             password: "password123"
 *             firstName: "Jane"
 *             lastName: "Smith"
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/auth/verify-token:
 *   get:
 *     summary: Verify JWT Token
 *     description: Verify the validity of a JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   example: "user_1234567890_abc123def"
 *                 exp:
 *                   type: integer
 *                   example: 1672531200
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/auth/profile:
 *   get:
 *     summary: Get User Profile
 *     description: Get the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/auth/update-balance:
 *   post:
 *     summary: Update User Balance
 *     description: Add or subtract from user's balance (admin or internal use)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, operation]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 100
 *               operation:
 *                 type: string
 *                 enum: [add, subtract]
 *                 example: "add"
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Balance updated successfully"
 *                 newBalance:
 *                   type: number
 *                   format: float
 *                   example: 1100
 *       400:
 *         description: Bad request or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Proxy to Main Service (Authentication, Users)
app.use('/api/auth', createProxyMiddleware({
  target: services.main,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
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
 *     summary: Get Football Fixtures
 *     description: Get list of football fixtures with optional filtering
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: league
 *         schema:
 *           type: integer
 *         description: League ID (e.g., 9 for Premier League)
 *         example: 9
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         description: Season year
 *         example: 2024
 *       - in: query
 *         name: team
 *         schema:
 *           type: integer
 *         description: Team ID
 *         example: 42
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date (YYYY-MM-DD)
 *         example: "2024-01-20"
 *       - in: query
 *         name: last
 *         schema:
 *           type: integer
 *         description: Number of past fixtures
 *         example: 10
 *       - in: query
 *         name: next
 *         schema:
 *           type: integer
 *         description: Number of upcoming fixtures
 *         example: 10
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *         description: Timezone for fixture times
 *         example: "UTC"
 *     responses:
 *       200:
 *         description: List of fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fixture'
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 *       500:
 *         description: Failed to fetch fixtures
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/fixtures/live:
 *   get:
 *     summary: Get Live Fixtures
 *     description: Get currently live football fixtures
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: Live fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fixture'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Failed to fetch live fixtures
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /api/odds/calculate:
 *   get:
 *     summary: Calculate Match Odds
 *     description: Calculate odds for a specific match using advanced algorithms
 *     tags: [Odds]
 *     parameters:
 *       - in: query
 *         name: homeTeam
 *         required: true
 *         schema:
 *           type: string
 *         description: Home team name
 *         example: "Arsenal"
 *       - in: query
 *         name: awayTeam
 *         required: true
 *         schema:
 *           type: string
 *         description: Away team name
 *         example: "Chelsea"
 *       - in: query
 *         name: league
 *         schema:
 *           type: integer
 *         description: League ID
 *         example: 9
 *     responses:
 *       200:
 *         description: Odds calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Odds'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to calculate odds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /api/wallet/balance:
 *   get:
 *     summary: Get Wallet Balance
 *     description: Get the authenticated user's wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletBalance'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/wallet/deposit:
 *   post:
 *     summary: Deposit Funds
 *     description: Deposit money into user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositRequest'
 *           example:
 *             amount: 100
 *             paymentMethod: "credit_card"
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Deposit successful"
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "trans_1234567890_abc123"
 *                     amount:
 *                       type: number
 *                       format: float
 *                       example: 100
 *                     newBalance:
 *                       type: number
 *                       format: float
 *                       example: 1350.50
 *       400:
 *         description: Invalid amount or payment method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/wallet/withdraw:
 *   post:
 *     summary: Withdraw Funds
 *     description: Withdraw money from user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 example: 50
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, paypal]
 *                 example: "bank_transfer"
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal successful"
 *                 newBalance:
 *                   type: number
 *                   format: float
 *                   example: 1300.50
 *       400:
 *         description: Insufficient balance or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/wallet/transactions:
 *   get:
 *     summary: Get Transaction History
 *     description: Get user's transaction history with pagination
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *         example: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, bet_placed, bet_won, bet_refund]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transaction history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         format: float
 *                       balanceAfter:
 *                         type: number
 *                         format: float
 *                       description:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
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
 * /api/bets/place:
 *   post:
 *     summary: Place a Bet
 *     description: Place a new bet on a football match
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BetRequest'
 *           example:
 *             fixtureId: 868549
 *             betType: "match_winner"
 *             selection: "home"
 *             stake: 25
 *             odds: 2.15
 *     responses:
 *       201:
 *         description: Bet placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bet placed successfully"
 *                 bet:
 *                   $ref: '#/components/schemas/Bet'
 *                 newBalance:
 *                   type: number
 *                   format: float
 *                   example: 1275.50
 *       400:
 *         description: Invalid bet parameters or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/bets/my:
 *   get:
 *     summary: Get User's Bets
 *     description: Get all bets placed by the authenticated user
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, won, lost, cancelled]
 *         description: Filter by bet status
 *       - in: query
 *         name: fixtureId
 *         schema:
 *           type: integer
 *         description: Filter by fixture ID
 *     responses:
 *       200:
 *         description: User bets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/bets/{betId}:
 *   get:
 *     summary: Get Specific Bet
 *     description: Get details of a specific bet by ID
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bet ID
 *         example: "bet_1234567890_xyz789"
 *     responses:
 *       200:
 *         description: Bet details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bet:
 *                   $ref: '#/components/schemas/Bet'
 *       404:
 *         description: Bet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Cancel Bet
 *     description: Cancel an active bet (only before match starts)
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bet ID
 *         example: "bet_1234567890_xyz789"
 *     responses:
 *       200:
 *         description: Bet cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bet cancelled and refunded successfully"
 *                 refundAmount:
 *                   type: number
 *                   format: float
 *                   example: 25
 *                 newBalance:
 *                   type: number
 *                   format: float
 *                   example: 1300.50
 *       400:
 *         description: Cannot cancel bet (match started or bet already settled)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/bets/stats/summary:
 *   get:
 *     summary: Get Betting Statistics
 *     description: Get comprehensive betting statistics for the authenticated user
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Betting statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalBets:
 *                       type: integer
 *                       example: 15
 *                     activeBets:
 *                       type: integer
 *                       example: 3
 *                     wonBets:
 *                       type: integer
 *                       example: 6
 *                     lostBets:
 *                       type: integer
 *                       example: 6
 *                     totalStaked:
 *                       type: number
 *                       format: float
 *                       example: 375
 *                     totalWinnings:
 *                       type: number
 *                       format: float
 *                       example: 428.50
 *                     netProfit:
 *                       type: number
 *                       format: float
 *                       example: 53.50
 *                     winRate:
 *                       type: number
 *                       format: float
 *                       example: 40
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
 *     summary: Get Match Results
 *     description: Get list of match results with pagination and filtering
 *     tags: [Results]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [finished, pending]
 *         description: Filter by match status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by match date
 *     responses:
 *       200:
 *         description: Match results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "result_1234567890_abc123"
 *                       fixtureId:
 *                         type: integer
 *                         example: 868549
 *                       homeTeam:
 *                         type: string
 *                         example: "Arsenal"
 *                       awayTeam:
 *                         type: string
 *                         example: "Chelsea"
 *                       homeScore:
 *                         type: integer
 *                         example: 2
 *                       awayScore:
 *                         type: integer
 *                         example: 1
 *                       winner:
 *                         type: string
 *                         enum: [home, away, draw]
 *                         example: "home"
 *                       status:
 *                         type: string
 *                         example: "finished"
 *                       matchDate:
 *                         type: string
 *                         format: date-time
 *                       processedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       500:
 *         description: Failed to fetch results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/results/{fixtureId}:
 *   get:
 *     summary: Get Specific Match Result
 *     description: Get result details for a specific fixture
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fixture ID
 *         example: 868549
 *     responses:
 *       200:
 *         description: Match result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     fixtureId:
 *                       type: integer
 *                       example: 868549
 *                     homeTeam:
 *                       type: string
 *                       example: "Arsenal"
 *                     awayTeam:
 *                       type: string
 *                       example: "Chelsea"
 *                     homeScore:
 *                       type: integer
 *                       example: 2
 *                     awayScore:
 *                       type: integer
 *                       example: 1
 *                     winner:
 *                       type: string
 *                       example: "home"
 *                     totalGoals:
 *                       type: integer
 *                       example: 3
 *                     bothTeamsScored:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: "finished"
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "goal"
 *                           player:
 *                             type: string
 *                             example: "Gabriel Jesus"
 *                           team:
 *                             type: string
 *                             example: "home"
 *                           minute:
 *                             type: integer
 *                             example: 23
 *       404:
 *         description: Result not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/results/evaluate:
 *   post:
 *     summary: Evaluate Match Result (Admin)
 *     description: Process and evaluate a finished match result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fixtureId, homeScore, awayScore, status]
 *             properties:
 *               fixtureId:
 *                 type: integer
 *                 example: 868549
 *               homeScore:
 *                 type: integer
 *                 example: 2
 *               awayScore:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: "finished"
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "goal"
 *                     player:
 *                       type: string
 *                       example: "Gabriel Jesus"
 *                     team:
 *                       type: string
 *                       example: "home"
 *                     minute:
 *                       type: integer
 *                       example: 23
 *     responses:
 *       200:
 *         description: Match result processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Match result processed successfully"
 *                 betsSettled:
 *                   type: integer
 *                   example: 12
 *                 payoutsProcessed:
 *                   type: integer
 *                   example: 8
 *       400:
 *         description: Invalid result data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
