# Yami Betting Platform - Technical Architecture Documentation

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Design & Schema](#database-design--schema)
3. [Docker & Containerization](#docker--containerization)
4. [External API Integration](#external-api-integration)
5. [Advanced Odds Calculation Algorithm](#advanced-odds-calculation-algorithm)
6. [Microservices Architecture](#microservices-architecture)
7. [Authentication & Security](#authentication--security)
8. [Caching & Performance](#caching--performance)
9. [Error Handling & Logging](#error-handling--logging)
10. [Deployment & Infrastructure](#deployment--infrastructure)

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  External APIs  │
│   Next.js 15    │◄──►│   Port: 8080     │◄──►│  API-Football   │
│   Port: 3000    │    │                  │    │  FBR API        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                          │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│  Main Service   │ Fixtures Service│  Odds Service   │Bet Service│
│   Port: 3001    │   Port: 3002    │   Port: 3003    │Port: 3005 │
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│ Wallet Service  │ Result Service  │                 │           │
│   Port: 3004    │   Port: 3006    │                 │           │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│    MongoDB      │   SQLite DB     │   Node Cache    │  In-Memory│
│   Port: 27017   │  (Odds Data)    │   (Fixtures)    │ (Fallback)│
│   Primary DB    │                 │                 │           │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### Technology Stack Deep Dive

#### Frontend Technologies
- **Next.js 15**: React framework with App Router for server-side rendering
- **React 19**: Latest React features including concurrent rendering
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Animation library for smooth user interactions
- **Radix UI**: Accessible component primitives
- **TypeScript**: Type safety and enhanced developer experience

#### Backend Technologies
- **Node.js 18+**: JavaScript runtime with ES2022 features
- **Express.js**: Minimalist web framework for REST APIs
- **JWT**: JSON Web Tokens for stateless authentication
- **bcryptjs**: Password hashing with salt rounds
- **Mongoose**: MongoDB object modeling for Node.js
- **Axios**: HTTP client for external API integration

---

## 🗄️ Database Design & Schema

### MongoDB Collections

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase, trimmed),
  password: String (bcrypt hashed, optional for OAuth),
  firstName: String (required, trimmed),
  lastName: String (required, trimmed),
  
  // OAuth Integration
  googleId: String (sparse index),
  avatar: String (URL),
  
  // Financial Data
  balance: Number (default: 1000.00, min: 0),
  
  // Comprehensive User Statistics
  stats: {
    totalBets: Number (default: 0),
    wonBets: Number (default: 0),
    lostBets: Number (default: 0),
    pendingBets: Number (default: 0),
    totalWinnings: Number (default: 0),
    totalLosses: Number (default: 0),
    highestWin: Number (default: 0),
    currentStreak: Number (default: 0, can be negative),
    longestWinStreak: Number (default: 0)
  },
  
  // User Preferences
  preferences: {
    currency: String (enum: ['USD', 'EUR', 'GBP']),
    timezone: String (default: 'UTC'),
    favoriteLeagues: [Number], // API-Football league IDs
    favoriteTeams: [Number], // API-Football team IDs
    notifications: {
      email: Boolean (default: true),
      betUpdates: Boolean (default: true),
      promotions: Boolean (default: false)
    }
  },
  
  // Account Management
  isActive: Boolean (default: true),
  emailVerified: Boolean (default: false),
  lastLogin: Date (default: now),
  
  // Risk Management
  dailyBetLimit: Number (default: 100.00),
  weeklyBetLimit: Number (default: 500.00),
  monthlyBetLimit: Number (default: 2000.00),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 } - unique
{ googleId: 1 } - sparse
{ createdAt: -1 }
{ "stats.totalBets": -1 }
```

#### 2. Bets Collection
```javascript
{
  _id: ObjectId,
  userId: String (indexed, references User._id),
  
  // Match Information
  fixtureId: String (indexed, from API-Football),
  
  // Bet Details
  betType: String (enum: [
    'match_winner',
    'over_under',
    'both_teams_score',
    'double_chance',
    'exact_score'
  ]),
  selection: String, // 'home', 'draw', 'away', 'over_2.5', 'yes', etc.
  stake: Number (min: 1, max: 10000),
  odds: Number (min: 1.01),
  potentialWin: Number (calculated: stake * odds),
  
  // Match Context for Reference
  matchInfo: {
    homeTeam: {
      id: Number,
      name: String
    },
    awayTeam: {
      id: Number,
      name: String
    },
    league: {
      id: Number,
      name: String,
      country: String
    },
    kickoffTime: Date
  },
  
  // Bet Resolution
  status: String (enum: ['active', 'won', 'lost', 'void', 'cancelled']),
  result: {
    isSettled: Boolean (default: false, indexed),
    settledAt: Date,
    finalScore: {
      home: Number,
      away: Number
    },
    winAmount: Number (default: 0)
  },
  
  // Metadata
  placedAt: Date (default: now, indexed),
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1, placedAt: -1 } - compound for user bet history
{ fixtureId: 1 } - for match-specific queries
{ status: 1 } - for bet status filtering
{ "result.isSettled": 1 } - for settlement processing
{ placedAt: -1 } - for recent bets
```

#### 3. Transactions Collection
```javascript
{
  _id: ObjectId,
  userId: String (indexed),
  
  // Transaction Details
  type: String (enum: [
    'deposit',
    'withdrawal',
    'bet_deduction',
    'bet_win',
    'bonus',
    'refund'
  ]),
  amount: Number,
  description: String,
  
  // Reference Data
  relatedBetId: String (optional, for bet-related transactions),
  relatedUserId: String (optional, for admin adjustments),
  
  // Status & Processing
  status: String (enum: ['pending', 'completed', 'failed', 'cancelled']),
  processingData: {
    initiatedBy: String, // 'user', 'system', 'admin'
    paymentMethod: String, // 'balance', 'card', 'paypal', etc.
    externalTransactionId: String
  },
  
  // Timestamps
  createdAt: Date (indexed),
  completedAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1, createdAt: -1 } - for user transaction history
{ type: 1, createdAt: -1 } - for transaction type queries
{ status: 1 } - for processing status
```

#### 4. Processed Results Collection
```javascript
{
  _id: ObjectId,
  fixtureId: String (unique, indexed),
  
  // Match Information
  homeTeamId: Number,
  awayTeamId: Number,
  leagueId: Number,
  
  // Final Result
  finalScore: {
    home: Number,
    away: Number,
    extraTime: {
      home: Number,
      away: Number
    },
    penalty: {
      home: Number,
      away: Number
    }
  },
  
  // Match Status
  status: String, // 'FT', 'AET', 'PEN', 'CANC', 'PST'
  matchDate: Date,
  
  // Processing Information
  betsProcessed: Number,
  totalPayouts: Number,
  affectedUsers: Number,
  
  // Timestamps
  processedAt: Date (indexed),
  lastUpdated: Date
}

// Indexes
{ fixtureId: 1 } - unique
{ processedAt: -1 }
{ status: 1 }
```

### SQLite Database (Odds Service)

#### Team Statistics Table
```sql
CREATE TABLE team_stats (
    team_id TEXT PRIMARY KEY,
    team_name TEXT,
    league_id INTEGER,
    season TEXT,
    matches_played INTEGER,
    wins INTEGER,
    draws INTEGER,
    losses INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    xg REAL, -- Expected Goals
    xga REAL, -- Expected Goals Against
    avg_possession REAL,
    pass_accuracy REAL,
    shots_per_game REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Head-to-Head Records
```sql
CREATE TABLE head_to_head (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_a TEXT,
    team_b TEXT,
    matches_played INTEGER,
    team_a_wins INTEGER,
    team_b_wins INTEGER,
    draws INTEGER,
    avg_goals_team_a REAL,
    avg_goals_team_b REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Recent Form Tracking
```sql
CREATE TABLE recent_form (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT,
    match_date DATE,
    opponent TEXT,
    result TEXT, -- 'W', 'D', 'L'
    goals_for INTEGER,
    goals_against INTEGER,
    xg REAL,
    xga REAL,
    home_away TEXT, -- 'home', 'away'
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Odds Calculation History
```sql
CREATE TABLE odds_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fixture_id TEXT,
    home_team TEXT,
    away_team TEXT,
    calculated_odds TEXT, -- JSON string
    confidence_score REAL,
    market_trends TEXT, -- JSON string
    calculation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐳 Docker & Containerization

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Primary Database
  mongodb:
    image: mongo:7.0
    container_name: betting-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: betting_platform
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - betting-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Database Management Interface
  mongo-express:
    image: mongo-express:1.0.2
    container_name: betting-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password123
      ME_CONFIG_MONGODB_URL: mongodb://admin:password123@mongodb:27017/
      ME_CONFIG_BASICAUTH: false
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - betting-network

  # Redis for Caching (Optional Enhancement)
  redis:
    image: redis:7-alpine
    container_name: betting-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - betting-network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  betting-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Container Health Checks

Each microservice includes comprehensive health check endpoints:

```javascript
// Health check implementation
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cacheStats = cache.getStats();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'service-name',
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
    uptime: `${Math.round(process.uptime())}s`,
    dependencies: {
      mongodb: 'connected',
      externalAPI: 'operational'
    }
  });
});
```

---

## 🌐 External API Integration

### API-Football Integration

#### Primary Data Source
- **Provider**: API-Sports (API-Football)
- **Base URL**: `https://v3.football.api-sports.io`
- **Rate Limits**: 100 requests/day (free tier)
- **Authentication**: API Key in header `x-apisports-key`

#### Endpoint Usage

1. **Live Fixtures**
```javascript
GET /fixtures?live=all&timezone=UTC
Headers: {
  'x-apisports-key': process.env.API_FOOTBALL_KEY
}

Response Structure:
{
  "response": [
    {
      "fixture": {
        "id": 868269,
        "referee": "John Doe",
        "timezone": "UTC",
        "date": "2024-01-15T15:00:00+00:00",
        "timestamp": 1705330800,
        "status": {
          "long": "Match Finished",
          "short": "FT",
          "elapsed": 90
        }
      },
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "season": 2023
      },
      "teams": {
        "home": {
          "id": 40,
          "name": "Liverpool",
          "logo": "https://media.api-sports.io/football/teams/40.png"
        },
        "away": {
          "id": 50,
          "name": "Manchester City",
          "logo": "https://media.api-sports.io/football/teams/50.png"
        }
      },
      "goals": {
        "home": 2,
        "away": 1
      },
      "score": {
        "halftime": {
          "home": 1,
          "away": 0
        },
        "fulltime": {
          "home": 2,
          "away": 1
        }
      }
    }
  ]
}
```

2. **Team Statistics**
```javascript
GET /teams/statistics?league=39&season=2023&team=40

Response includes:
- Matches played, wins, draws, losses
- Goals for/against
- Home/away performance
- Form guide
- Average possession
- Cards received
```

### FBR API Integration (Secondary Source)

#### Advanced Statistical Data
- **Provider**: Football Data API (FBR)
- **Purpose**: Enhanced statistical analysis
- **Features**: xG data, advanced metrics, player statistics

```javascript
// FBR API Usage Example
const getTeamStats = async (teamId, leagueId) => {
  const response = await axios.get(`${FBR_BASE_URL}/team-season-stats`, {
    params: { 
      team_id: teamId, 
      league_id: leagueId, 
      season_id: '2023-2024' 
    },
    headers: { 'X-API-Key': process.env.FBR_API_KEY }
  });
  
  return {
    xg: response.data.stats.ttl_xg,
    xga: response.data.stats.ttl_xga,
    possession: response.data.possession.avg_poss,
    passAccuracy: response.data.passing.pct_pass_cmp
  };
};
```

### API Resilience & Fallback Strategy

1. **Circuit Breaker Pattern**
```javascript
class APICircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

2. **Data Caching Strategy**
```javascript
// Multi-layer caching
const getFixtures = async () => {
  // 1. Check in-memory cache (30 seconds)
  let fixtures = cache.get('live_fixtures');
  if (fixtures) return fixtures;
  
  // 2. Check database cache (5 minutes)
  fixtures = await db.collection('cached_fixtures')
    .findOne({ 
      type: 'live',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
  if (fixtures) {
    cache.set('live_fixtures', fixtures.data, 30);
    return fixtures.data;
  }
  
  // 3. Fetch from API
  try {
    fixtures = await fetchFromAPI();
    cache.set('live_fixtures', fixtures, 30);
    await db.collection('cached_fixtures').insertOne({
      type: 'live',
      data: fixtures,
      createdAt: new Date()
    });
    return fixtures;
  } catch (error) {
    // 4. Return stale data if available
    const staleData = await db.collection('cached_fixtures')
      .findOne({ type: 'live' }, { sort: { createdAt: -1 } });
    return staleData?.data || [];
  }
};
```

---

## 🧮 Advanced Odds Calculation Algorithm

### Mathematical Foundation

The odds calculation engine uses a sophisticated multi-factor model that combines statistical analysis, machine learning principles, and real-time data processing.

#### Core Algorithm Components

1. **Team Strength Calculation**
```javascript
calculateOverallStrength(teamStats) {
  const weights = {
    attack: 0.4,    // Offensive capabilities
    defense: 0.3,   // Defensive stability
    form: 0.2,      // Recent performance
    efficiency: 0.1  // Goal conversion efficiency
  };

  const attackStrength = this.calculateAttackingStrength(teamStats);
  const defenseStrength = this.calculateDefensiveStrength(teamStats);
  const formRating = this.calculateFormRating(teamStats);
  const efficiency = this.calculateEfficiency(teamStats);

  return (
    attackStrength * weights.attack +
    defenseStrength * weights.defense +
    formRating * weights.form +
    efficiency * weights.efficiency
  );
}
```

2. **Attacking Strength Formula**
```javascript
calculateAttackingStrength(stats) {
  const goalsPerGame = stats.goalsFor / stats.matchesPlayed;
  const xgPerGame = stats.xg / stats.matchesPlayed;
  const shotAccuracy = stats.shotsOnTarget / stats.totalShots;
  const bigChanceConversion = stats.bigChancesScored / stats.bigChancesCreated;
  
  // Weighted combination with xG having high importance
  return (
    goalsPerGame * 25 +      // Actual goal output
    xgPerGame * 35 +         // Expected goals (quality of chances)
    shotAccuracy * 20 +      // Shot efficiency
    bigChanceConversion * 20 // Finishing ability
  );
}
```

3. **Defensive Strength Formula**
```javascript
calculateDefensiveStrength(stats) {
  const goalsAgainstPerGame = stats.goalsAgainst / stats.matchesPlayed;
  const xgaPerGame = stats.xga / stats.matchesPlayed;
  const cleanSheetRate = stats.cleanSheets / stats.matchesPlayed;
  const tackleSuccessRate = stats.tacklesWon / stats.tacklesAttempted;
  
  return Math.max(0, 
    100 - (
      goalsAgainstPerGame * 15 +  // Goals conceded
      xgaPerGame * 20 +           // Expected goals against
      (1 - cleanSheetRate) * 10 + // Clean sheet frequency
      (1 - tackleSuccessRate) * 5 // Defensive actions
    )
  );
}
```

#### Advanced Probability Calculations

1. **Poisson Distribution for Goal Expectations**
```javascript
calculateGoalProbabilities(homeAttack, awayDefense, homeDefense, awayAttack) {
  // Expected goals using attack vs defense strength
  const homeExpectedGoals = (homeAttack / 100) * (awayDefense / 100) * 1.1; // Home advantage
  const awayExpectedGoals = (awayAttack / 100) * (homeDefense / 100);
  
  // Poisson distribution for exact scores
  const poissonProbability = (lambda, k) => {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  };
  
  const scoreProbabilities = {};
  for (let homeGoals = 0; homeGoals <= 5; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 5; awayGoals++) {
      const prob = poissonProbability(homeExpectedGoals, homeGoals) * 
                   poissonProbability(awayExpectedGoals, awayGoals);
      scoreProbabilities[`${homeGoals}-${awayGoals}`] = prob;
    }
  }
  
  return {
    homeExpectedGoals,
    awayExpectedGoals,
    scoreProbabilities
  };
}
```

2. **Home Advantage Modeling**
```javascript
calculateHomeAdvantage(homeTeam, league) {
  const baseHomeAdvantage = 0.15; // 15% base advantage
  
  // League-specific adjustments
  const leagueAdjustments = {
    39: 0.12,  // Premier League (lower due to quality)
    140: 0.18, // La Liga (higher home crowds)
    78: 0.16,  // Bundesliga
    135: 0.14, // Serie A
    61: 0.17   // Ligue 1
  };
  
  // Team-specific home record
  const homeWinRate = homeTeam.homeWins / homeTeam.homeMatches;
  const homeGoalDiff = (homeTeam.homeGoalsFor - homeTeam.homeGoalsAgainst) / homeTeam.homeMatches;
  
  const adjustment = leagueAdjustments[league] || baseHomeAdvantage;
  const teamFactor = (homeWinRate - 0.5) * 0.1; // Adjust based on home form
  const goalFactor = Math.min(homeGoalDiff * 0.02, 0.05); // Max 5% from goals
  
  return Math.max(0.05, Math.min(0.25, adjustment + teamFactor + goalFactor));
}
```

#### Market Efficiency & Value Detection

1. **Kelly Criterion for Bet Sizing**
```javascript
calculateKellyCriterion(trueOdds, bookmakerOdds, bankroll) {
  const trueProbability = 1 / trueOdds;
  const impliedProbability = 1 / bookmakerOdds;
  
  if (trueProbability <= impliedProbability) {
    return 0; // No value bet
  }
  
  const edge = trueProbability - impliedProbability;
  const kellyFraction = edge / (bookmakerOdds - 1);
  
  // Conservative Kelly (25% of full Kelly to reduce variance)
  const conservativeKelly = kellyFraction * 0.25;
  
  return Math.max(0, Math.min(conservativeKelly, 0.05)); // Max 5% of bankroll
}
```

2. **Confidence Score Calculation**
```javascript
calculateConfidenceScore(homeStats, awayStats, dataQuality) {
  const factors = {
    dataCompleteness: Math.min(homeStats.matchesPlayed, awayStats.matchesPlayed) / 20,
    statisticalSignificance: this.calculateStatisticalSignificance(homeStats, awayStats),
    consistencyIndex: this.calculateConsistency(homeStats, awayStats),
    recentFormReliability: this.calculateFormReliability(homeStats, awayStats)
  };
  
  const baseConfidence = 50;
  const confidenceBoost = (
    factors.dataCompleteness * 20 +
    factors.statisticalSignificance * 15 +
    factors.consistencyIndex * 10 +
    factors.recentFormReliability * 5
  );
  
  return Math.min(95, Math.max(30, baseConfidence + confidenceBoost));
}
```

#### Real-time Odds Adjustment

```javascript
adjustOddsForLiveEvents(baseOdds, liveFactors) {
  let adjustmentFactor = 1.0;
  
  // Red cards
  if (liveFactors.redCards.home > liveFactors.redCards.away) {
    adjustmentFactor *= 0.7; // Home team disadvantaged
  } else if (liveFactors.redCards.away > liveFactors.redCards.home) {
    adjustmentFactor *= 1.4; // Home team advantaged
  }
  
  // Current score
  const goalDifference = liveFactors.score.home - liveFactors.score.away;
  if (goalDifference > 0) {
    adjustmentFactor *= (1 - goalDifference * 0.1); // Reduce home odds if winning
  } else if (goalDifference < 0) {
    adjustmentFactor *= (1 + Math.abs(goalDifference) * 0.15); // Increase home odds if losing
  }
  
  // Time factor
  const elapsedMinutes = liveFactors.elapsed;
  const timeFactor = 1 + (elapsedMinutes / 90) * 0.2; // Increase volatility over time
  
  return {
    home: Math.max(1.01, baseOdds.home * adjustmentFactor),
    draw: Math.max(1.01, baseOdds.draw * (2 - adjustmentFactor * 0.5)),
    away: Math.max(1.01, baseOdds.away * (2 - adjustmentFactor))
  };
}
```

---

## 🛡️ Authentication & Security

### JWT Implementation

#### Token Structure
```javascript
// JWT Payload
{
  sub: "user_id",           // Subject (user ID)
  iat: 1640995200,          // Issued at
  exp: 1641081600,          // Expiry (24 hours)
  iss: "yami-betting",      // Issuer
  aud: "yami-users",        // Audience
  roles: ["user"],          // User roles
  permissions: [],          // Specific permissions
  sessionId: "uuid",        // Session tracking
  ipAddress: "192.168.1.1", // IP binding
  deviceId: "device_hash"   // Device fingerprinting
}
```

#### Advanced Security Middleware
```javascript
const advancedAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    // Verify session is still active
    const session = await redis.get(`session:${decoded.sessionId}`);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // IP Address validation (optional)
    if (process.env.STRICT_IP_BINDING === 'true') {
      if (decoded.ipAddress !== req.ip) {
        return res.status(401).json({ error: 'IP address mismatch' });
      }
    }
    
    // Load user data
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};
```

### Password Security

#### Bcrypt Configuration
```javascript
const bcrypt = require('bcryptjs');

// High security configuration
const SALT_ROUNDS = 12; // Computationally expensive but secure

const hashPassword = async (password) => {
  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }
  
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};
```

### Rate Limiting Strategy

```javascript
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    }),
    keyGenerator: (req) => {
      // Combine IP and user ID for authenticated requests
      return req.user ? `${req.ip}:${req.user._id}` : req.ip;
    }
  });
};

// Apply different limits to different endpoints
app.use('/auth/login', createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts'));
app.use('/bets', createRateLimiter(60 * 1000, 10, 'Too many betting requests'));
app.use('/api', createRateLimiter(15 * 60 * 1000, 100, 'Rate limit exceeded'));
```

---

## ⚡ Caching & Performance

### Multi-Layer Caching Strategy

1. **In-Memory Caching (Node-Cache)**
```javascript
const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 300,           // Default 5 minutes
  checkperiod: 60,       // Cleanup every minute
  useClones: false,      // Better performance
  deleteOnExpire: true,  // Auto cleanup
  maxKeys: 10000        // Memory limit
});

// Usage patterns
cache.set('fixtures:live', fixtures, 30);     // 30 seconds for live data
cache.set('odds:calculated', odds, 300);       // 5 minutes for odds
cache.set('user:stats', userStats, 600);      // 10 minutes for user stats
```

2. **Database-Level Caching**
```javascript
// MongoDB aggregation with caching
const getUserStatsWithCache = async (userId) => {
  const cacheKey = `user_stats:${userId}`;
  let stats = cache.get(cacheKey);
  
  if (!stats) {
    stats = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'bets',
          localField: '_id',
          foreignField: 'userId',
          as: 'userBets'
        }
      },
      {
        $project: {
          totalBets: { $size: '$userBets' },
          activeBets: {
            $size: {
              $filter: {
                input: '$userBets',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          },
          // ... other calculations
        }
      }
    ]);
    
    cache.set(cacheKey, stats[0], 600); // 10 minutes
  }
  
  return stats;
};
```

### Database Optimization

#### Indexes for Performance
```javascript
// User collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ "stats.totalBets": -1 });
db.users.createIndex({ isActive: 1, role: 1 });

// Bets collection indexes
db.bets.createIndex({ userId: 1, placedAt: -1 });
db.bets.createIndex({ fixtureId: 1 });
db.bets.createIndex({ status: 1 });
db.bets.createIndex({ "result.isSettled": 1 });
db.bets.createIndex({ placedAt: -1 });

// Compound indexes for complex queries
db.bets.createIndex({ userId: 1, status: 1, placedAt: -1 });
db.bets.createIndex({ fixtureId: 1, status: 1 });
```

#### Query Optimization
```javascript
// Efficient pagination with proper indexing
const getUserBets = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  return Bet.aggregate([
    { $match: { userId: userId } },
    { $sort: { placedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'processed_results',
        localField: 'fixtureId',
        foreignField: 'fixtureId',
        as: 'matchResult'
      }
    },
    {
      $project: {
        // Only return necessary fields
        betType: 1,
        selection: 1,
        stake: 1,
        odds: 1,
        status: 1,
        placedAt: 1,
        'matchInfo.homeTeam.name': 1,
        'matchInfo.awayTeam.name': 1,
        'result.winAmount': 1
      }
    }
  ]);
};
```

---

## 🔧 Error Handling & Logging

### Comprehensive Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error ${err.name}: ${err.message}`.red);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### Advanced Logging System
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'betting-platform' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage in application
logger.info('User logged in', { userId, ipAddress, userAgent });
logger.warn('High bet amount detected', { userId, amount, betType });
logger.error('Database connection failed', { error: err.message, stack: err.stack });
```

---

## 🚀 Deployment & Infrastructure

### Production Environment Setup

#### Environment Variables
```bash
# Database Configuration
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_URI_FALLBACK=mongodb://fallback-host:port/database

# JWT Security
JWT_SECRET=super-secure-secret-key-256-bits
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-secure-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# External APIs
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_HOST=v3.football.api-sports.io
FBR_API_KEY=your-fbr-api-key
FBR_API_BASE_URL=https://fbrapi.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Service URLs
FRONTEND_URL=https://your-domain.com
API_GATEWAY_URL=https://api.your-domain.com
MAIN_SERVICE_URL=http://localhost:3001

# Security & Performance
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=session-secret-key
CORS_ORIGIN=https://your-domain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

#### Production Docker Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway
      - frontend

  api-gateway:
    build: ./backend/api-gateway
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  main-service:
    build: ./backend/main-service
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
    restart: unless-stopped

  # ... other services

  mongodb:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

#### Kubernetes Deployment (Advanced)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: betting-main-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: main-service
  template:
    metadata:
      labels:
        app: main-service
    spec:
      containers:
      - name: main-service
        image: betting-platform/main-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

This comprehensive technical documentation covers every aspect of the Yami Betting Platform's architecture, from the sophisticated odds calculation algorithms to the production deployment strategies. The system demonstrates enterprise-level practices in microservices architecture, database design, security implementation, and performance optimization.
