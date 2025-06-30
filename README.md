# 🎲 Elite Betting Platform

A professional betting platform with real-time football data, statistical odds calculation, and modern microservices architecture.

![Platform Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### ⚡ Real-Time Data
- **Live Football Matches** from API-Football
- **Real-Time Scores** and match updates
- **Statistical Odds Calculation** using FBRef data
- **Auto-Refresh** every 30 seconds

### 🎯 Advanced Analytics
- **Team Performance Analysis** 
- **Statistical Odds Calculation**
- **Competition Rankings** (Premier League, La Liga, etc.)
- **Confidence Scoring** for predictions

### 🏗️ Architecture
- **Microservices Architecture** with 3 specialized services
- **Next.js Frontend** with TypeScript
- **RESTful APIs** with comprehensive error handling
- **Intelligent Caching** for optimal performance

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** components
- **Lucide React** icons

### Backend Services
- **Node.js + Express** microservices
- **MongoDB** for user data
- **SQLite** for odds calculations
- **JWT Authentication** + Google OAuth
- **Rate Limiting** and security middleware

### External APIs
- **API-Football** - Live match data
- **FBRef API** - Team statistics and performance data

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional, for user features)

### 1. Clone Repository
```bash
git clone https://github.com/[username]/betting-app-yami.git
cd betting-app-yami
```

### 2. Install Dependencies
```bash
# Install all service dependencies
cd backend/fixtures-service && npm install && cd ../..
cd backend/odds-service && npm install && cd ../..
cd backend/main-service && npm install && cd ../..
cd frontend && npm install && cd ..
```

### 3. Environment Setup
```bash
# Copy environment files
cp backend/fixtures-service/env.example backend/fixtures-service/.env
cp backend/odds-service/env.example backend/odds-service/.env
cp backend/main-service/env.example backend/main-service/.env
```

### 4. Start All Services
```bash
# Use the provided startup script
chmod +x start-services.sh
./start-services.sh
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Test Page**: Open `test-live-matches.html`
- **API Health**: http://localhost:3002/health

## 🏗️ Project Structure

```
betting-app-yami/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Utilities and helpers
├── backend/
│   ├── fixtures-service/    # Live match data service (Port 3002)
│   ├── odds-service/        # Statistical odds calculation (Port 3003)
│   └── main-service/        # Authentication & user management (Port 3001)
├── logs/                    # Service logs
├── start-services.sh        # Startup script
├── stop-services.sh         # Shutdown script
└── test-live-matches.html   # Standalone test page
```

## 🎯 Services Overview

### 📡 Fixtures Service (Port 3002)
- Fetches live match data from API-Football
- Calculates statistical odds using team performance
- Intelligent caching with 5-minute TTL
- Competition sorting and grouping

**Key Endpoints:**
- `GET /fixtures/live-now` - Live matches with odds
- `GET /fixtures/today` - Today's matches
- `GET /health` - Service health check

### 🎲 Odds Service (Port 3003)
- Advanced statistical odds calculation
- SQLite database for historical data
- FBRef API integration for team statistics
- Confidence scoring and market analysis

**Key Endpoints:**
- `GET /calculate` - Calculate match odds
- `GET /live-comparison` - Compare with market odds
- `GET /fixtures/:id` - Odds for specific fixture

### 👤 Main Service (Port 3001)
- User authentication (JWT + Google OAuth)
- Bet placement and management
- User statistics and leaderboards
- MongoDB for data persistence

**Key Endpoints:**
- `POST /auth/login` - User authentication
- `GET /api/user/stats` - User statistics
- `POST /api/bets` - Place bets

## 🔧 Management

### Start Services
```bash
./start-services.sh
```

### Stop Services
```bash
./stop-services.sh
```

### View Logs
```bash
tail -f logs/frontend.log
tail -f logs/fixtures.log
tail -f logs/odds.log
```

### Health Checks
```bash
curl http://localhost:3002/health  # Fixtures service
curl http://localhost:3003/health  # Odds service
curl http://localhost:3001/health  # Main service (requires MongoDB)
```

## 🌐 API Documentation

### Live Matches Endpoint
```http
GET /api/fixtures/live
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
        "status": { "short": "2H", "elapsed": 90 }
      },
      "league": {
        "name": "Victoria NPL",
        "country": "Australia"
      },
      "teams": {
        "home": { "name": "Melbourne Victory II" },
        "away": { "name": "Melbourne Knights" }
      },
      "goals": { "home": 1, "away": 2 },
      "calculatedOdds": {
        "homeWin": 2.54,
        "draw": 3.29,
        "awayWin": 3.96,
        "confidence": "high"
      }
    }
  ],
  "groupedByCompetition": { ... }
}
```

## 🔐 Environment Variables

### Required API Keys
- `API_FOOTBALL_KEY` - API-Football subscription key
- `FBR_API_KEY` - FBRef API key for statistics

### Optional Configuration
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

## 🚀 Deployment

### Development
```bash
./start-services.sh
```

### Production
1. Set up MongoDB instance
2. Configure environment variables
3. Use PM2 or Docker for process management
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **API-Football** for comprehensive football data
- **FBRef** for detailed team statistics
- **Radix UI** for accessible components
- **Vercel** for Next.js framework

## 📞 Support

For support and questions:
- Open an issue in this repository
- Check the logs directory for debugging
- Review the health check endpoints

---

**⚽ Built with passion for football and betting analytics!** 