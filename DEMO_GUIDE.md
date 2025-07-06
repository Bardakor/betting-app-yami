# 🎯 Demo Scripts Usage Guide

## 🆕 Recent Improvements (Version 2.0)

### Enhanced Reliability & User Experience
- **🛡️ Robust Error Handling**: Eliminated all terminal error messages (`head: illegal line count`, `jq parse errors`)
- **🔧 macOS Compatibility**: Fixed all platform-specific command issues
- **🛑 Safe JSON Processing**: Added helper functions for safe JSON parsing and field extraction
- **📡 Connection Resilience**: Graceful handling of network failures and empty responses
- **✨ Clean Output**: Professional, error-free terminal output suitable for presentations
- **🔄 Smart Fallbacks**: Automatic fallback to default values when APIs are unavailable

### Technical Improvements
- Safe JSON formatting with validation
- Enhanced field extraction with null-checking
- Better HTTP status code handling
- Improved connection failure detection
- Eliminated unsafe shell operations

---

## Available Demo Scripts

### 1. 📊 **Complete System Demo** - `./demo.sh`
**The ultimate showcase script that demonstrates everything**

```bash
./demo.sh
```

**What it demonstrates:**
- ✅ **Health checks** for all 6 microservices
- ✅ **Database operations** (MongoDB queries, collections)
- ✅ **Authentication flow** (registration, login, JWT, OAuth)
- ✅ **External API integration** (API-Football, circuit breakers)
- ✅ **Advanced odds calculation** (statistical engine, ML algorithms)
- ✅ **Wallet operations** (deposits, transactions, admin adjustments)
- ✅ **Complete betting workflow** (place bets, track, settle)
- ✅ **Result processing** (match settlement, automated payouts)
- ✅ **Admin features** (user management, system stats)
- ✅ **Performance monitoring** (response times, rate limiting)
- ✅ **Error handling** (validation, security, edge cases)
- ✅ **Real-time features** (live updates, event simulation)

**Duration:** ~15-20 minutes
**Best for:** Full presentations, comprehensive testing

---

### 2. ⚡ **Quick Test** - `./quick-test.sh`
**Fast verification that all core systems work**

```bash
./quick-test.sh
```

**What it tests:**
- 🏥 Service health checks
- 🔐 Authentication (admin login)
- 💰 Wallet balance retrieval
- 🌐 Live fixtures from external API
- 🧮 Odds calculation engine
- 👤 User profile access

**Duration:** ~30 seconds
**Best for:** Quick verification, development testing

---

## 🚀 Prerequisites

### Required Software
```bash
# Essential
curl        # For API calls
jq          # For JSON formatting (optional but recommended)

# Install jq (optional, for prettier output)
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Or just use curl without jq - scripts work either way
```

### Services Must Be Running
```bash
# Start all services first
./bash/start-services.sh

# Or manually start each service
cd backend/main-service && npm start      # Port 3001
cd backend/fixtures-service && npm start # Port 3002
cd backend/odds-service && npm start     # Port 3003
cd backend/wallet-service && npm start   # Port 3004
cd backend/bet-service && npm start      # Port 3005
cd backend/result-service && npm start   # Port 3006
```

---

## 🎬 Demonstration Scenarios

### 📚 **For Academic Presentations**
```bash
# Full demo showing all requirements exceeded
./demo.sh

# Focus on specific sections:
# - Health checks (microservices architecture)
# - Authentication (security implementation)
# - Database operations (multi-database usage)
# - External APIs (real-world integration)
# - Advanced algorithms (odds calculation)
```

### 💼 **For Job Interviews**
```bash
# Quick overview first
./quick-test.sh

# Then dive deep into technical details
./demo.sh

# Highlight these sections:
# - Microservices communication
# - Database design and optimization
# - Security best practices
# - Performance considerations
# - Error handling strategies
```

### 🔧 **For Development Testing**
```bash
# Quick sanity check during development
./quick-test.sh

# Full regression testing
./demo.sh

# Individual API testing
curl -X GET http://localhost:3001/health
curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"admin123"}'
```

---

## 🎯 Manual API Testing Commands

### Authentication & Security
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Get profile (requires token)
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test access denied
curl -X GET http://localhost:3001/auth/profile
# Should return 401 Unauthorized
```

### Live Data & Odds
```bash
# Get live fixtures
curl -X GET http://localhost:3002/fixtures/live

# Calculate odds
curl -X GET "http://localhost:3003/odds/calculate?homeTeam=Arsenal&awayTeam=Chelsea&league=39"

# Get team statistics
curl -X GET "http://localhost:3003/odds/team-stats/42?league=39&season=2023-2024"
```

### Betting Workflow
```bash
# Check balance
curl -X GET http://localhost:3004/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Place bet
curl -X POST http://localhost:3005/api/bets/place \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fixtureId": "868549",
    "betType": "match_winner",
    "selection": "home",
    "stake": 25,
    "odds": 2.15
  }'

# Check betting history
curl -X GET http://localhost:3005/api/bets/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Operations
```bash
# MongoDB operations (via API)
curl -X GET http://localhost:3001/api/admin/stats/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Transaction history
curl -X GET http://localhost:3004/api/wallet/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔍 Troubleshooting

### Services Not Responding
```bash
# Check if services are running
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3006/health

# If any fail, restart that service
cd backend/[service-name] && npm start
```

### Authentication Issues
```bash
# Verify admin credentials
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' \
  -v

# Check if token is valid
curl -X GET http://localhost:3001/auth/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Connection Issues
```bash
# Check MongoDB connection
curl -X GET http://localhost:3001/health

# Start MongoDB if using Docker
docker-compose up mongodb -d
```

---

## 📊 Expected Output Examples

### Successful Health Check
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "main-service",
  "version": "1.0.0",
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "67MB"
  },
  "uptime": "120s"
}
```

### Successful Authentication
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_1234567890_abc123def",
    "email": "admin@admin.com",
    "firstName": "Admin",
    "lastName": "User",
    "balance": 100000,
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Odds Calculation Result
```json
{
  "success": true,
  "data": {
    "homeTeam": {
      "name": "Arsenal",
      "odds": 2.15,
      "probability": 46.5,
      "strength": 85
    },
    "awayTeam": {
      "name": "Chelsea",
      "odds": 3.40,
      "probability": 29.4,
      "strength": 78
    },
    "confidence": 92,
    "analysis": {
      "expectedGoals": { "home": 1.8, "away": 1.2 },
      "recommendation": { "type": "value", "outcome": "home" }
    }
  }
}
```

---

## 🎉 Success Metrics

### ✅ **All Systems Operational**
- All 6 microservices respond to health checks
- Authentication returns valid JWT tokens
- External APIs return live data
- Database operations complete successfully
- Betting workflow processes end-to-end
- Financial transactions are atomic and secure

### 🏆 **Enterprise Features Demonstrated**
- Microservices architecture with proper separation
- Multi-database operations (MongoDB, SQLite, Cache)
- Real-time data processing with intelligent caching
- Advanced statistical analysis and machine learning
- Production-grade security and error handling
- Comprehensive logging and monitoring

---

Use these scripts to showcase your **enterprise-grade sports betting platform** that exceeds all academic requirements and demonstrates professional software development practices! 🚀
