# Elite Betting Platform - Complete API Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [API Gateway](#api-gateway)
4. [Main Service (Authentication & Users)](#main-service)
5. [Fixtures Service](#fixtures-service)
6. [Odds Service](#odds-service)
7. [Wallet Service](#wallet-service)
8. [Bet Service](#bet-service)
9. [Result Service](#result-service)
10. [Service Interactions](#service-interactions)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Example Workflows](#example-workflows)

---

## Architecture Overview

The Elite Betting Platform is built on a microservices architecture with 7 core services:

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │   API Gateway    │
│  (Port 3000)    │────│   (Port 8000)    │
└─────────────────┘    └──────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼────┐ ┌────▼────┐ ┌───▼──────┐
            │Main Service│ │Fixtures │ │   Odds   │
            │(Port 3001) │ │(Port    │ │(Port     │
            │            │ │ 3002)   │ │ 3003)    │
            └────────────┘ └─────────┘ └──────────┘
                    │
            ┌───────┼───────┐
            │       │       │
    ┌───────▼──┐ ┌──▼────┐ ┌▼──────────┐
    │ Wallet   │ │ Bet   │ │  Result   │
    │(Port     │ │(Port  │ │ (Port     │
    │ 3004)    │ │ 3005) │ │  3006)    │
    └──────────┘ └───────┘ └───────────┘
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 8000 | Request routing, rate limiting, documentation |
| Main Service | 3001 | Authentication, user management, JWT tokens |
| Fixtures Service | 3002 | Football match data, external API integration |
| Odds Service | 3003 | Dynamic odds calculation, market analysis |
| Wallet Service | 3004 | Financial transactions, balance management |
| Bet Service | 3005 | Bet placement, tracking, management |
| Result Service | 3006 | Match result evaluation, bet settlement |

---

## Authentication System

### JWT Token-Based Authentication

The platform uses JWT (JSON Web Tokens) for authentication across all services.

#### Token Structure
```json
{
  "userId": "user_1234567890_abc123def",
  "exp": 1672531200,
  "iat": 1672444800
}
```

#### Authentication Flow
1. User logs in via Main Service
2. Main Service validates credentials
3. JWT token issued with 24-hour expiration
4. Token included in Authorization header for subsequent requests
5. Services verify tokens with Main Service

#### Authorization Header Format
```
Authorization: Bearer <jwt_token>
```

---

## API Gateway

**Base URL:** `http://localhost:8000`

### Health Endpoints

#### Gateway Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "gateway": "API Gateway",
  "services": ["main", "fixtures", "odds", "wallet", "bet", "result"]
}
```

#### Service Health Status
```http
GET /health/services
```

**Response:**
```json
{
  "gateway": "healthy",
  "services": [
    {
      "name": "main",
      "status": "healthy",
      "url": "http://localhost:3001",
      "response": {
        "status": "OK",
        "service": "main-service"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Proxied Routes

The API Gateway proxies requests to appropriate services:

| Route Pattern | Target Service | Example |
|---------------|----------------|---------|
| `/api/auth/*` | Main Service | `/api/auth/login` |
| `/api/users/*` | Main Service | `/api/users/profile` |
| `/api/fixtures/*` | Fixtures Service | `/api/fixtures/live` |
| `/api/odds/*` | Odds Service | `/api/odds/calculate` |
| `/api/wallet/*` | Wallet Service | `/api/wallet/balance` |
| `/api/bets/*` | Bet Service | `/api/bets/place` |
| `/api/results/*` | Result Service | `/api/results/evaluate` |

### Documentation

#### Swagger Documentation
```http
GET /docs
```
Access interactive API documentation via Swagger UI.

---

## Main Service

**Base URL:** `http://localhost:3001`

### Authentication Endpoints

#### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_1234567890_abc123def",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "balance": 1000,
    "stats": {
      "totalBets": 0,
      "wonBets": 0,
      "lostBets": 0,
      "pendingBets": 0,
      "totalWinnings": 0,
      "totalLosses": 0
    },
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_1234567891_def456ghi",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "balance": 1000,
    "stats": {
      "totalBets": 0,
      "wonBets": 0,
      "lostBets": 0,
      "pendingBets": 0,
      "totalWinnings": 0,
      "totalLosses": 0
    },
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Google OAuth Callback
```http
POST /auth/google/callback
Content-Type: application/json

{
  "code": "google_oauth_authorization_code",
  "state": "optional_state_parameter"
}
```

#### Token Verification
```http
GET /auth/verify-token
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "userId": "user_1234567890_abc123def",
  "exp": 1672531200
}
```

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123def",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "balance": 1000,
    "stats": {
      "totalBets": 5,
      "wonBets": 2,
      "lostBets": 2,
      "pendingBets": 1,
      "totalWinnings": 250,
      "totalLosses": 150
    },
    "isActive": true
  }
}
```

#### Update User Balance
```http
POST /auth/update-balance
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "operation": "add"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance updated successfully",
  "newBalance": 1100
}
```

### Admin Endpoints

#### Admin Balance Update
```http
POST /auth/admin/update-user-balance
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "user_1234567890_abc123def",
  "amount": 500,
  "operation": "add"
}
```

#### Get User Balance (Service-to-Service)
```http
GET /auth/user/{userId}/balance
```

**Response:**
```json
{
  "success": true,
  "balance": 1000
}
```

---

## Fixtures Service

**Base URL:** `http://localhost:3002`

### Fixture Endpoints

#### Get All Fixtures
```http
GET /fixtures
```

**Query Parameters:**
- `league` (optional): League ID (e.g., 9 for Premier League)
- `season` (optional): Season year (e.g., 2024)
- `team` (optional): Team ID
- `date` (optional): Specific date (YYYY-MM-DD)
- `last` (optional): Number of past fixtures
- `next` (optional): Number of upcoming fixtures
- `timezone` (optional): Timezone (default: UTC)

**Example Request:**
```http
GET /fixtures?league=9&season=2024&next=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fixture": {
        "id": 868549,
        "referee": "Michael Oliver",
        "timezone": "UTC",
        "date": "2024-01-20T15:00:00+00:00",
        "timestamp": 1705759200,
        "periods": {
          "first": null,
          "second": null
        },
        "venue": {
          "id": 526,
          "name": "Emirates Stadium",
          "city": "London"
        },
        "status": {
          "long": "Not Started",
          "short": "NS",
          "elapsed": null
        }
      },
      "league": {
        "id": 9,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/9.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2024,
        "round": "Regular Season - 21"
      },
      "teams": {
        "home": {
          "id": 42,
          "name": "Arsenal",
          "logo": "https://media.api-sports.io/football/teams/42.png",
          "winner": null
        },
        "away": {
          "id": 49,
          "name": "Chelsea",
          "logo": "https://media.api-sports.io/football/teams/49.png",
          "winner": null
        }
      },
      "goals": {
        "home": null,
        "away": null
      },
      "score": {
        "halftime": {
          "home": null,
          "away": null
        },
        "fulltime": {
          "home": null,
          "away": null
        },
        "extratime": {
          "home": null,
          "away": null
        },
        "penalty": {
          "home": null,
          "away": null
        }
      }
    }
  ],
  "count": 1,
  "filters": {
    "league": "9",
    "season": "2024",
    "next": "10",
    "timezone": "UTC"
  }
}
```

#### Get Live Fixtures
```http
GET /fixtures/live
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fixture": {
        "id": 868550,
        "date": "2024-01-15T15:00:00+00:00",
        "status": {
          "long": "Second Half",
          "short": "2H",
          "elapsed": 67
        }
      },
      "teams": {
        "home": {
          "id": 40,
          "name": "Liverpool",
          "winner": true
        },
        "away": {
          "id": 33,
          "name": "Manchester United",
          "winner": false
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
          "home": null,
          "away": null
        }
      }
    }
  ],
  "count": 1
}
```

#### Get Specific Fixture
```http
GET /fixtures/{fixtureId}
```

**Response:**
```json
{
  "success": true,
  "fixture": {
    "fixture": {
      "id": 868549,
      "date": "2024-01-20T15:00:00+00:00",
      "status": {
        "short": "NS"
      }
    },
    "teams": {
      "home": {
        "id": 42,
        "name": "Arsenal"
      },
      "away": {
        "id": 49,
        "name": "Chelsea"
      }
    },
    "league": {
      "id": 9,
      "name": "Premier League"
    }
  }
}
```

#### Get Leagues
```http
GET /fixtures/leagues
```

**Query Parameters:**
- `country` (optional): Country name
- `season` (optional): Season year
- `current` (optional): Current season only (true/false)

#### Get Teams
```http
GET /fixtures/teams
```

**Query Parameters:**
- `league` (optional): League ID
- `season` (optional): Season year
- `search` (optional): Team name search

#### Get Enhanced Fixtures with Statistics
```http
GET /fixtures/enhanced
```

**Response includes statistical odds and team analysis**

---

## Odds Service

**Base URL:** `http://localhost:3003`

### Odds Calculation Endpoints

#### Calculate Match Odds
```http
GET /odds/calculate?homeTeam=Arsenal&awayTeam=Chelsea&league=9
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fixtureId": "arsenal_chelsea_2024",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "homeTeam": {
      "name": "Arsenal",
      "odds": 2.15,
      "probability": 46.5,
      "impliedProbability": "46.51%"
    },
    "awayTeam": {
      "name": "Chelsea", 
      "odds": 3.40,
      "probability": 29.4,
      "impliedProbability": "29.41%"
    },
    "draw": {
      "odds": 3.20,
      "probability": 24.1,
      "impliedProbability": "24.08%"
    },
    "overUnder": {
      "over2_5": {
        "odds": 1.85,
        "probability": 54.1
      },
      "under2_5": {
        "odds": 1.95,
        "probability": 45.9
      }
    },
    "bothTeamsScore": {
      "yes": {
        "odds": 1.75,
        "probability": 57.1
      },
      "no": {
        "odds": 2.05,
        "probability": 42.9
      }
    },
    "confidence": "high",
    "factors": {
      "homeAdvantage": 0.15,
      "formRating": {
        "home": 8.2,
        "away": 7.8
      },
      "headToHead": {
        "homeWins": 3,
        "awayWins": 2,
        "draws": 1,
        "last6Meetings": "W-L-D-W-W-L"
      },
      "injuries": {
        "home": 1,
        "away": 2
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Get Team Statistics
```http
GET /odds/team-stats/{teamId}?league=9&season=2023-2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": 42,
      "name": "Arsenal",
      "rating": 8.8
    },
    "season": "2023-2024",
    "league": 9,
    "stats": {
      "played": 20,
      "wins": 13,
      "draws": 4,
      "losses": 3,
      "goalsFor": 38,
      "goalsAgainst": 18,
      "goalDifference": 20,
      "points": 43,
      "averageGoalsPerGame": 1.9,
      "averageGoalsAgainst": 0.9,
      "cleanSheets": 8,
      "failedToScore": 2
    },
    "form": {
      "recent": "W-W-D-W-L",
      "last10": {
        "wins": 7,
        "draws": 2,
        "losses": 1
      }
    },
    "homeRecord": {
      "played": 10,
      "wins": 8,
      "draws": 1,
      "losses": 1
    },
    "awayRecord": {
      "played": 10,
      "wins": 5,
      "draws": 3,
      "losses": 2
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Bulk Odds Calculation
```http
POST /odds/calculate-bulk
Content-Type: application/json

{
  "matches": [
    {
      "id": "match_1",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "league": 9
    },
    {
      "id": "match_2", 
      "homeTeam": "Liverpool",
      "awayTeam": "Manchester City",
      "league": 9
    }
  ]
}
```

#### Get Market Trends
```http
GET /odds/market-trends
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trending": {
      "mostBackedTeams": [
        {
          "team": "Manchester City",
          "backingPercentage": 67.3
        }
      ],
      "biggestOddsMovements": [
        {
          "match": "Arsenal vs Chelsea",
          "market": "home_win",
          "from": 2.20,
          "to": 2.15,
          "movement": -2.3
        }
      ]
    },
    "marketStats": {
      "averageHomeWinOdds": 2.34,
      "averageAwayWinOdds": 3.21,
      "averageDrawOdds": 3.15
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Live Odds Comparison
```http
GET /odds/live-comparison?homeTeam=Arsenal&awayTeam=Chelsea&league=9
```

**Response includes comparison with major bookmakers**

---

## Wallet Service

**Base URL:** `http://localhost:3004`

### Wallet Management Endpoints

#### Get User Balance
```http
GET /api/wallet/balance
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "balance": 1250.50,
  "currency": "USD"
}
```

#### Deposit Funds
```http
POST /api/wallet/deposit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "paymentMethod": "credit_card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit successful",
  "transaction": {
    "id": "trans_1234567890_abc123",
    "amount": 100,
    "newBalance": 1350.50,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Withdraw Funds
```http
POST /api/wallet/withdraw
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 50,
  "paymentMethod": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "transaction": {
    "id": "trans_1234567891_def456",
    "amount": 50,
    "newBalance": 1300.50,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?page=1&limit=20&type=deposit
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `type` (optional): Transaction type filter

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "trans_1234567890_abc123",
      "type": "deposit",
      "amount": 100,
      "balanceAfter": 1350.50,
      "description": "Deposit via credit_card",
      "status": "completed",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "metadata": {
        "paymentMethod": "credit_card",
        "transactionId": "dep_1705320600_abc123"
      }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Process Bet Transaction (Internal)
```http
POST /api/wallet/process-bet
Content-Type: application/json

{
  "userId": "user_1234567890_abc123def",
  "amount": 25,
  "type": "bet_placed",
  "betId": "bet_1234567890_xyz789",
  "fixtureId": 868549,
  "description": "Bet placed: Arsenal vs Chelsea"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 1275.50,
  "transactionId": "trans_1234567892_ghi789"
}
```

### Admin Endpoints

#### Add Funds to User Account
```http
POST /api/wallet/admin/add-funds
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "user_1234567890_abc123def",
  "amount": 500,
  "description": "Admin bonus credit"
}
```

---

## Bet Service

**Base URL:** `http://localhost:3005`

### Betting Endpoints

#### Place a Bet
```http
POST /api/bets/place
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fixtureId": 868549,
  "betType": "match_winner",
  "selection": "home",
  "stake": 25,
  "odds": 2.15
}
```

**Bet Types:**
- `match_winner`: Home/Away/Draw
- `over_under`: Over/Under goals
- `both_teams_score`: Yes/No
- `double_chance`: Home or Draw, Away or Draw, Home or Away
- `exact_score`: Specific scoreline

**Response:**
```json
{
  "success": true,
  "message": "Bet placed successfully",
  "bet": {
    "id": "bet_1234567890_xyz789",
    "fixtureId": 868549,
    "betType": "match_winner",
    "selection": "home",
    "stake": 25,
    "odds": 2.15,
    "potentialWin": 53.75,
    "matchInfo": {
      "homeTeam": {
        "id": 42,
        "name": "Arsenal"
      },
      "awayTeam": {
        "id": 49,
        "name": "Chelsea"
      },
      "league": {
        "id": 9,
        "name": "Premier League",
        "country": "England"
      },
      "kickoffTime": "2024-01-20T15:00:00.000Z"
    },
    "status": "active",
    "placedAt": "2024-01-15T10:30:00.000Z"
  },
  "newBalance": 1275.50
}
```

#### Get User's Bets
```http
GET /api/bets/my?page=1&limit=20&status=active
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page
- `status` (optional): Filter by bet status (active, won, lost, cancelled)
- `fixtureId` (optional): Filter by fixture

**Response:**
```json
{
  "success": true,
  "bets": [
    {
      "id": "bet_1234567890_xyz789",
      "fixtureId": 868549,
      "betType": "match_winner",
      "selection": "home",
      "stake": 25,
      "odds": 2.15,
      "potentialWin": 53.75,
      "matchInfo": {
        "homeTeam": {
          "id": 42,
          "name": "Arsenal"
        },
        "awayTeam": {
          "id": 49,
          "name": "Chelsea"
        },
        "league": {
          "id": 9,
          "name": "Premier League"
        },
        "kickoffTime": "2024-01-20T15:00:00.000Z"
      },
      "status": "active",
      "result": null,
      "placedAt": "2024-01-15T10:30:00.000Z",
      "profitLoss": 0
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Specific Bet
```http
GET /api/bets/{betId}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "bet": {
    "id": "bet_1234567890_xyz789",
    "fixtureId": 868549,
    "betType": "match_winner",
    "selection": "home",
    "stake": 25,
    "odds": 2.15,
    "potentialWin": 53.75,
    "matchInfo": {
      "homeTeam": {
        "id": 42,
        "name": "Arsenal"
      },
      "awayTeam": {
        "id": 49,
        "name": "Chelsea"
      },
      "league": {
        "id": 9,
        "name": "Premier League"
      },
      "kickoffTime": "2024-01-20T15:00:00.000Z"
    },
    "status": "won",
    "result": {
      "outcome": "home",
      "score": "2-1",
      "winAmount": 53.75
    },
    "placedAt": "2024-01-15T10:30:00.000Z",
    "profitLoss": 28.75
  }
}
```

#### Cancel Bet
```http
DELETE /api/bets/{betId}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Bet cancelled and refunded successfully",
  "refundAmount": 25,
  "newBalance": 1300.50
}
```

#### Get Betting Statistics
```http
GET /api/bets/stats/summary
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBets": 15,
    "activeBets": 3,
    "wonBets": 6,
    "lostBets": 6,
    "totalStaked": 375,
    "totalWinnings": 428.50,
    "netProfit": 53.50,
    "winRate": 40,
    "averageOdds": 2.47,
    "biggestWin": 120.00,
    "longestWinStreak": 3,
    "favoriteMarket": "match_winner",
    "profitByMonth": {
      "2024-01": 53.50
    }
  }
}
```

### Admin Endpoints

#### Get All Bets (Admin)
```http
GET /api/bets/admin/all?page=1&limit=50&status=active
Authorization: Bearer <admin_jwt_token>
```

#### Settle Bets for Fixture
```http
POST /api/bets/settle/{fixtureId}
Content-Type: application/json

{
  "matchResult": {
    "score": {
      "home": 2,
      "away": 1
    },
    "winner": "home",
    "totalGoals": 3,
    "bothTeamsScored": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settled 12 bets for fixture 868549",
  "settledBets": 12,
  "details": [
    {
      "betId": "bet_1234567890_xyz789",
      "userId": "user_1234567890_abc123def",
      "status": "won",
      "stake": 25,
      "winAmount": 53.75
    }
  ]
}
```

---

## Result Service

**Base URL:** `http://localhost:3006`

### Result Processing Endpoints

#### Evaluate Match Result
```http
POST /api/results/evaluate
Content-Type: application/json

{
  "fixtureId": 868549,
  "homeScore": 2,
  "awayScore": 1,
  "status": "finished",
  "events": [
    {
      "type": "goal",
      "player": "Gabriel Jesus",
      "team": "home",
      "minute": 23
    },
    {
      "type": "goal",
      "player": "Raheem Sterling",
      "team": "away",
      "minute": 45
    },
    {
      "type": "goal",
      "player": "Martin Ødegaard",
      "team": "home",
      "minute": 67
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Match result processed successfully",
  "result": {
    "fixtureId": 868549,
    "homeScore": 2,
    "awayScore": 1,
    "winner": "home",
    "totalGoals": 3,
    "bothTeamsScored": true,
    "status": "finished",
    "processedAt": "2024-01-20T17:05:00.000Z"
  },
  "betsSettled": 12,
  "payoutsProcessed": 8
}
```

#### Get All Results
```http
GET /api/results?page=1&limit=20&status=finished
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page
- `status` (optional): Filter by status
- `date` (optional): Filter by date

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "result_1234567890_abc123",
      "fixtureId": 868549,
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "homeScore": 2,
      "awayScore": 1,
      "winner": "home",
      "totalGoals": 3,
      "bothTeamsScored": true,
      "status": "finished",
      "matchDate": "2024-01-20T15:00:00.000Z",
      "processedAt": "2024-01-20T17:05:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Specific Result
```http
GET /api/results/{fixtureId}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "fixtureId": 868549,
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "homeScore": 2,
    "awayScore": 1,
    "winner": "home",
    "totalGoals": 3,
    "bothTeamsScored": true,
    "status": "finished",
    "events": [
      {
        "type": "goal",
        "player": "Gabriel Jesus",
        "team": "home",
        "minute": 23
      }
    ],
    "matchDate": "2024-01-20T15:00:00.000Z",
    "processedAt": "2024-01-20T17:05:00.000Z"
  }
}
```

#### Settle Finished Matches
```http
POST /api/results/settle
```

**Response:**
```json
{
  "success": true,
  "message": "Settlement process completed",
  "summary": {
    "matchesProcessed": 5,
    "betsSettled": 47,
    "payoutsProcessed": 23,
    "totalPayouts": 2847.50
  }
}
```

#### Get Result Statistics
```http
GET /api/results/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMatches": 150,
    "finishedMatches": 142,
    "pendingMatches": 8,
    "totalBetsSettled": 1247,
    "totalPayouts": 24891.50,
    "averageGoalsPerMatch": 2.7,
    "homeWinPercentage": 42.3,
    "awayWinPercentage": 31.7,
    "drawPercentage": 26.0,
    "bothTeamsScorePercentage": 58.5
  }
}
```

---

## Service Interactions

### Cross-Service Communication Flow

#### Bet Placement Flow
1. **User places bet** → Bet Service
2. **Bet Service verifies token** → Main Service
3. **Bet Service gets fixture details** → Fixtures Service  
4. **Bet Service verifies odds** → Odds Service
5. **Bet Service processes payment** → Wallet Service
6. **Wallet Service updates balance** → Main Service
7. **Bet Service saves bet** → MongoDB
8. **Response to user** ← Bet Service

#### Result Processing Flow
1. **Match finishes** → External API
2. **Result Service processes result** → MongoDB
3. **Result Service settles bets** → Bet Service
4. **Bet Service processes winnings** → Wallet Service
5. **Wallet Service credits winners** → Main Service

### Service Dependencies

```mermaid
graph TD
    A[API Gateway] --> B[Main Service]
    A --> C[Fixtures Service]
    A --> D[Odds Service]
    A --> E[Wallet Service]
    A --> F[Bet Service]
    A --> G[Result Service]
    
    F --> B
    F --> C
    F --> D
    F --> E
    
    E --> B
    
    G --> F
    G --> E
    
    D --> C
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `INSUFFICIENT_BALANCE` | 400 | User has insufficient funds |
| `BET_LIMIT_EXCEEDED` | 400 | Bet amount exceeds limits |
| `FIXTURE_NOT_FOUND` | 404 | Fixture does not exist |
| `MATCH_ALREADY_STARTED` | 400 | Cannot bet on started match |
| `ODDS_CHANGED` | 400 | Odds have changed significantly |
| `SERVICE_UNAVAILABLE` | 503 | Dependent service is down |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Error Examples

#### Authentication Error
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "code": "INVALID_TOKEN",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Insufficient Balance Error
```json
{
  "success": false,
  "message": "Insufficient balance. Required: $25, Available: $15",
  "code": "INSUFFICIENT_BALANCE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "stake",
      "message": "Stake must be between $1 and $10,000"
    }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Rate Limiting

### Rate Limit Configuration

| Service | Window | Max Requests | Scope |
|---------|--------|--------------|-------|
| API Gateway | 15 minutes | 100 | Per IP |
| Main Service | 15 minutes | 100 | Per IP |
| Fixtures Service | 15 minutes | 200 | Per IP |
| Odds Service | 15 minutes | 300 | Per IP |
| Wallet Service | 15 minutes | 100 | Per IP |
| Bet Service | 15 minutes | 100 | Per IP |
| Result Service | 15 minutes | 100 | Per IP |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1705321500
```

### Rate Limit Error Response

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Example Workflows

### Complete Betting Workflow

#### 1. User Registration and Login
```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Response includes JWT token
# Use token for subsequent requests
```

#### 2. Check Balance
```bash
curl -X GET http://localhost:8000/api/wallet/balance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Deposit Funds
```bash
curl -X POST http://localhost:8000/api/wallet/deposit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "paymentMethod": "credit_card"
  }'
```

#### 4. Get Available Fixtures
```bash
curl -X GET "http://localhost:8000/api/fixtures?league=9&next=10"
```

#### 5. Get Odds for Match
```bash
curl -X GET "http://localhost:8000/api/odds/calculate?homeTeam=Arsenal&awayTeam=Chelsea&league=9"
```

#### 6. Place Bet
```bash
curl -X POST http://localhost:8000/api/bets/place \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fixtureId": 868549,
    "betType": "match_winner",
    "selection": "home",
    "stake": 25,
    "odds": 2.15
  }'
```

#### 7. Check Bet Status
```bash
curl -X GET http://localhost:8000/api/bets/my \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 8. Check Results (After Match)
```bash
curl -X GET http://localhost:8000/api/results/868549
```

### Admin Workflow

#### 1. Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "admin123"
  }'
```

#### 2. View All Bets
```bash
curl -X GET http://localhost:8000/api/bets/admin/all \
  -H "Authorization: Bearer <admin_token>"
```

#### 3. Add Funds to User Account
```bash
curl -X POST http://localhost:8000/api/wallet/admin/add-funds \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1234567890_abc123def",
    "amount": 500,
    "description": "Welcome bonus"
  }'
```

#### 4. Process Match Result
```bash
curl -X POST http://localhost:8000/api/results/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "fixtureId": 868549,
    "homeScore": 2,
    "awayScore": 1,
    "status": "finished"
  }'
```

---

## Database Schema

### MongoDB Collections

#### Users (Main Service)
```javascript
{
  _id: ObjectId,
  id: "user_1234567890_abc123def",
  email: "user@example.com",
  password: "hashed_password",
  firstName: "John",
  lastName: "Doe",
  balance: 1000,
  isActive: true,
  stats: {
    totalBets: 5,
    wonBets: 2,
    lostBets: 2,
    pendingBets: 1,
    totalWinnings: 250,
    totalLosses: 150
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Bets (Bet Service)
```javascript
{
  _id: ObjectId,
  userId: "user_1234567890_abc123def",
  fixtureId: 868549,
  betType: "match_winner",
  selection: "home",
  stake: 25,
  odds: 2.15,
  potentialWin: 53.75,
  status: "active", // active, won, lost, cancelled
  matchInfo: {
    homeTeam: { id: 42, name: "Arsenal" },
    awayTeam: { id: 49, name: "Chelsea" },
    league: { id: 9, name: "Premier League" },
    kickoffTime: Date
  },
  result: {
    outcome: "home",
    score: "2-1",
    winAmount: 53.75
  },
  placedAt: Date,
  settledAt: Date
}
```

#### Transactions (Wallet Service)
```javascript
{
  _id: ObjectId,
  userId: "user_1234567890_abc123def",
  type: "deposit", // deposit, withdrawal, bet_placed, bet_won, bet_refund
  amount: 100,
  balanceAfter: 1100,
  description: "Deposit via credit_card",
  status: "completed",
  metadata: {
    paymentMethod: "credit_card",
    transactionId: "dep_1705320600_abc123",
    betId: "bet_1234567890_xyz789"
  },
  createdAt: Date
}
```

#### Results (Result Service)
```javascript
{
  _id: ObjectId,
  fixtureId: 868549,
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  homeScore: 2,
  awayScore: 1,
  winner: "home",
  totalGoals: 3,
  bothTeamsScored: true,
  status: "finished",
  events: [
    {
      type: "goal",
      player: "Gabriel Jesus",
      team: "home",
      minute: 23
    }
  ],
  matchDate: Date,
  processedAt: Date
}
```

---

## Security Considerations

### Authentication Security
- JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Token verification on every request
- Secure session management

### API Security
- CORS configuration for allowed origins
- Helmet.js for security headers
- Request validation and sanitization
- SQL injection prevention
- XSS protection

### Rate Limiting
- IP-based rate limiting
- Service-specific limits
- Graceful degradation on limit exceeded

### Financial Security
- Balance validation before bet placement
- Transaction logging and audit trail
- Atomic operations for financial transactions
- Duplicate transaction prevention

---

## Performance Optimizations

### Caching Strategy
- **Fixtures Service**: 5-30 minute cache for fixture data
- **Odds Service**: 10-minute cache for calculated odds
- **API Gateway**: Response caching for static content

### Database Optimization
- Indexed queries on frequently accessed fields
- Connection pooling
- Query optimization

### Service Communication
- Connection timeouts and retries
- Circuit breaker pattern for service failures
- Async processing where possible

---

## Monitoring and Logging

### Health Checks
Each service provides:
- `/health` endpoint for basic health status
- Memory usage monitoring
- Database connection status
- Cache statistics

### Request Logging
- Request/response logging with timestamps
- IP address tracking
- User identification in logs
- Error tracking and alerting

### Performance Metrics
- Response time monitoring
- Success/failure rates
- Service dependency tracking
- Database query performance

---

## Environment Configuration

### Environment Variables

#### Common Variables
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/elite_betting
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

#### Service-Specific Variables
```env
# Main Service
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Fixtures Service
API_FOOTBALL_KEY=your_api_football_key
API_FOOTBALL_HOST=v3.football.api-sports.io

# Service URLs
MAIN_SERVICE_URL=http://localhost:3001
FIXTURES_SERVICE_URL=http://localhost:3002
ODDS_SERVICE_URL=http://localhost:3003
WALLET_SERVICE_URL=http://localhost:3004
BET_SERVICE_URL=http://localhost:3005
RESULT_SERVICE_URL=http://localhost:3006
```

---

## Deployment

### Docker Deployment
The platform includes Docker configuration for easy deployment:

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up api-gateway main-service

# View logs
docker-compose logs -f bet-service
```

### Service Startup Order
1. MongoDB containers
2. Main Service (authentication dependency)
3. Other microservices
4. API Gateway (last, depends on all services)

---

This documentation provides a complete reference for the Elite Betting Platform API. Each endpoint includes examples, and the service interactions are clearly defined to help developers understand how to integrate with and extend the platform.
