# Yami Betting Platform - API Documentation

## Overview

The Yami Betting Platform is built with a microservices architecture providing comprehensive betting functionality through multiple specialized services. All APIs use JWT authentication for secure access.

## Base URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Main Service | `http://localhost:3001` | Authentication, user management, API orchestration |
| Fixtures Service | `http://localhost:3002` | Live match data and fixtures |
| Odds Service | `http://localhost:3003` | Statistical odds calculation |
| Wallet Service | `http://localhost:3004` | Payment processing and transactions |
| Bet Service | `http://localhost:3005` | Bet placement and management |
| Result Service | `http://localhost:3006` | Match result processing |

## Authentication

### JWT Token Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Get JWT Token (Login)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin123",
    "email": "admin@admin.com",
    "firstName": "Admin",
    "lastName": "User",
    "balance": 100000
  }
}
```

### Google OAuth Authentication
```http
GET /auth/google
```
Redirects to Google OAuth consent screen.

## API Paradigms Implemented

### 1. REST API
Traditional HTTP methods (GET, POST, PUT, DELETE) with resource-based URLs.

### 2. Polling/Real-time Updates
Client-side polling every 30 seconds for live data updates, simulating real-time behavior.

## Main Service API (`http://localhost:3001`)

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Get User Profile
```http
GET /auth/me
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

### Fixtures Endpoints

#### Get Live Fixtures
```http
GET /api/fixtures/live
Authorization: Bearer <jwt-token> (optional)
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "fixtures": [
    {
      "fixture": {
        "id": 1319208,
        "date": "2024-06-30T10:30:00Z",
        "status": { "short": "2H", "elapsed": 90 }
      },
      "league": {
        "name": "Chinese Super League",
        "country": "China"
      },
      "teams": {
        "home": { "name": "Beijing Guoan" },
        "away": { "name": "Shanghai Port" }
      },
      "goals": { "home": 1, "away": 2 },
      "calculatedOdds": {
        "homeWin": 2.54,
        "draw": 3.29,
        "awayWin": 3.96,
        "confidence": "high"
      }
    }
  ]
}
```

#### Get Fixtures by Date
```http
GET /api/fixtures?date=2024-06-30&league=39
Authorization: Bearer <jwt-token> (optional)
```

### Betting Endpoints

#### Place Bet
```http
POST /api/bets
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fixtureId": 1319208,
  "betType": "Match Winner",
  "selection": "home",
  "stake": 50,
  "odds": 2.54
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bet placed successfully",
  "bet": {
    "id": "bet_123456",
    "stake": 50,
    "potentialWin": 127,
    "status": "pending"
  }
}
```

#### Get User Bets
```http
GET /api/bets?page=1&limit=20&status=pending
Authorization: Bearer <jwt-token>
```

#### Get User Statistics
```http
GET /api/user/stats
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBets": 25,
    "wonBets": 15,
    "lostBets": 8,
    "pendingBets": 2,
    "totalWinnings": 1250.50,
    "totalLosses": 400.00,
    "winRate": 60,
    "profit": 850.50
  }
}
```

### Admin Endpoints

#### Create Admin User
```http
POST /api/admin/create
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

#### Update User Balance (Admin Only)
```http
POST /api/admin/update-user-balance
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userId": "user123",
  "amount": 500,
  "description": "Bonus credit"
}
```

#### Get All Users (Admin Only)
```http
GET /api/admin/users?page=1&limit=20&search=john
Authorization: Bearer <admin-jwt-token>
```

## Fixtures Service API (`http://localhost:3002`)

### Live Matches
```http
GET /api/fixtures/live-now
```

### Today's Matches
```http
GET /api/fixtures/today
```

### Search Teams
```http
GET /api/fixtures/teams/search?name=arsenal
```

### Get Fixture by ID
```http
GET /api/fixtures/12345
```

## Odds Service API (`http://localhost:3003`)

### Calculate Odds
```http
GET /api/odds/calculate?homeTeamId=1&awayTeamId=2&leagueId=39
```

**Response:**
```json
{
  "success": true,
  "odds": {
    "homeWin": 2.54,
    "draw": 3.29,
    "awayWin": 3.96,
    "confidence": "high",
    "stats": {
      "home": {
        "name": "Arsenal",
        "rating": 85,
        "goalsPerGame": 2.1,
        "form": 80
      },
      "away": {
        "name": "Chelsea",
        "rating": 82,
        "goalsPerGame": 1.8,
        "form": 75
      }
    }
  }
}
```

### Bulk Calculate Odds
```http
POST /api/odds/calculate-bulk
Content-Type: application/json

{
  "fixtures": [
    { "homeTeamId": 1, "awayTeamId": 2, "leagueId": 39 },
    { "homeTeamId": 3, "awayTeamId": 4, "leagueId": 39 }
  ]
}
```

### Market Trends
```http
GET /api/odds/market-trends?league=39&timeframe=week
```

### Live Odds Comparison
```http
GET /api/odds/live-comparison?fixtureId=12345
```

## Wallet Service API (`http://localhost:3004`)

### Get Balance
```http
GET /api/wallet/balance
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "balance": 1250.50,
  "currency": "USD"
}
```

### Deposit Funds
```http
POST /api/wallet/deposit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 100,
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

### Withdraw Funds
```http
POST /api/wallet/withdraw
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 50,
  "paymentMethod": "bank_transfer",
  "accountDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "987654321"
  }
}
```

### Get Transactions
```http
GET /api/wallet/transactions?page=1&limit=20&type=deposit
Authorization: Bearer <jwt-token>
```

### Admin Add Funds
```http
POST /api/wallet/admin/add-funds
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userId": "user123",
  "amount": 500,
  "description": "Bonus funds"
}
```

## Bet Service API (`http://localhost:3005`)

### Place Bet
```http
POST /api/bets/place
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fixtureId": 12345,
  "betType": "Match Winner",
  "selection": "home",
  "stake": 25,
  "odds": 2.50,
  "market": "1X2"
}
```

### Get My Bets
```http
GET /api/bets/my?page=1&limit=20&status=pending
Authorization: Bearer <jwt-token>
```

### Get Bet Details
```http
GET /api/bets/bet_123456
Authorization: Bearer <jwt-token>
```

### Cancel Bet
```http
DELETE /api/bets/bet_123456
Authorization: Bearer <jwt-token>
```

### Betting Statistics
```http
GET /api/bets/stats/summary
Authorization: Bearer <jwt-token>
```

### Admin: Get All Bets
```http
GET /api/bets/admin/all?page=1&limit=50
Authorization: Bearer <admin-jwt-token>
```

### Settle Bets for Fixture
```http
POST /api/bets/settle/12345
Content-Type: application/json

{
  "homeScore": 2,
  "awayScore": 1,
  "status": "finished"
}
```

## Result Service API (`http://localhost:3006`)

### Process All Results (Admin Only)
```http
POST /api/results/process/all
Authorization: Bearer <admin-jwt-token>
```

### Process Specific Fixture (Admin Only)
```http
POST /api/results/process/12345
Authorization: Bearer <admin-jwt-token>
```

### Get Processing Statistics (Admin Only)
```http
GET /api/results/stats
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProcessed": 156,
    "totalBetsSettled": 1247,
    "totalPayouts": 45678.90,
    "averageProcessingTime": 2.3,
    "lastProcessedAt": "2024-06-30T15:30:00Z"
  }
}
```

### Get Recent Results (Admin Only)
```http
GET /api/results/recent?limit=10
Authorization: Bearer <admin-jwt-token>
```

### Check Result Status
```http
GET /api/results/status/12345
Authorization: Bearer <jwt-token>
```

### Get My Results
```http
GET /api/results/my?page=1&limit=20
Authorization: Bearer <jwt-token>
```

## Error Responses

All APIs return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `ACCESS_DENIED` | 403 | Insufficient privileges |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INSUFFICIENT_BALANCE` | 400 | Not enough funds for operation |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

All API endpoints are rate-limited:
- **General APIs**: 100 requests per 15 minutes per IP
- **Betting APIs**: 5 bets per minute per user
- **Authentication**: 10 login attempts per hour per IP

## Testing with Postman

### Quick Start Collection

1. **Get Admin Token**:
   ```
   POST http://localhost:3001/auth/login
   Body: {"email": "admin@admin.com", "password": "admin123"}
   ```

2. **Test Protected Endpoint**:
   ```
   GET http://localhost:3001/api/user/stats
   Headers: Authorization: Bearer <token-from-step-1>
   ```

3. **Place Test Bet**:
   ```
   POST http://localhost:3001/api/bets
   Headers: Authorization: Bearer <token>
   Body: {
     "fixtureId": 1319208,
     "betType": "Match Winner",
     "selection": "home",
     "stake": 10,
     "odds": 2.50
   }
   ```

4. **Test Without Token (Should Fail)**:
   ```
   GET http://localhost:3001/api/user/stats
   (No Authorization header)
   Expected: 401 Unauthorized
   ```

### Environment Variables for Postman

```
BASE_URL_MAIN = http://localhost:3001
BASE_URL_FIXTURES = http://localhost:3002
BASE_URL_ODDS = http://localhost:3003
BASE_URL_WALLET = http://localhost:3004
BASE_URL_BETS = http://localhost:3005
BASE_URL_RESULTS = http://localhost:3006
JWT_TOKEN = {{token-from-login}}
```

## External API Integration

The platform integrates with:
- **API-Football**: Live match data and fixtures
- **Statistical calculations**: Custom odds calculation engine

## Database Schema

### MongoDB Collections:
- **users**: User accounts and profiles
- **bets**: Betting records
- **transactions**: Wallet transactions
- **processed_results**: Match result processing logs

### In-Memory Storage (Fallback):
- User data with admin account auto-creation
- Transaction history
- Temporary bet storage

## Production Considerations

1. **Security**: All passwords are bcrypt hashed
2. **Validation**: Input validation on all endpoints
3. **Error Handling**: Comprehensive error responses
4. **Logging**: Request/response logging across all services
5. **Health Checks**: Available at `/health` on all services
6. **CORS**: Configured for frontend access
7. **Rate Limiting**: Implemented to prevent abuse 