# Mini Betting Platform

A microservices-based betting platform built with React frontend and Node.js backend services, featuring Google OAuth authentication and MongoDB storage.

## 🏗️ Architecture

### Frontend
- **React**: Modern SPA with routing and state management
- **React Router**: Client-side routing for different pages
- **Custom CSS**: Responsive design with modern UI components

### Backend Microservices
1. **Main Service** (Port 3001): User authentication, Google OAuth, JWT management
2. **Betting Service** (Port 3002): Bet placement, user bet history, bet management
3. **Fixtures Service** (Port 3003): Football fixture data, external API integration

### Database
- **MongoDB**: Multiple databases for service separation
  - `mini-betting-platform-users`: User authentication data
  - `mini-betting-platform-betting`: Betting data and history
  - `mini-betting-platform-fixtures`: Football fixtures and match data

## ✨ Features

### Authentication & Security
- Google OAuth 2.0 integration
- JWT-based authentication
- Protected API routes
- Session management
- Secure cookie handling

### Betting Features
- Browse football fixtures
- Place bets on match outcomes (Home/Draw/Away)
- View betting history
- Real-time odds display
- Betting statistics and analytics

### User Experience
- Responsive design for all devices
- Real-time data updates
- Intuitive navigation
- User dashboard with statistics
- Profile management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or remote)
- Google OAuth credentials

### 1. Installation
```bash
# Clone and install all dependencies
git clone <repository>
cd mini-betting-platform
npm run install-all
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/mini-betting-platform

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT & Session Secrets
JWT_SECRET=your-secure-secret-key
SESSION_SECRET=your-session-secret-key

# Service URLs
CLIENT_URL=http://localhost:3000
MAIN_SERVICE_URL=http://localhost:3001
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback`
6. Update `.env` with your credentials

### 4. Start Development
```bash
# Start all services concurrently
npm run dev

# Or start individually:
npm run start:main     # Main service (3001)
npm run start:betting  # Betting service (3002)
npm run start:fixtures # Fixtures service (3003)
npm run start:frontend # React frontend (3000)
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Main API**: http://localhost:3001
- **Betting API**: http://localhost:3002
- **Fixtures API**: http://localhost:3003

## 📱 Usage

### For Users
1. **Login**: Click "Continue with Google" to authenticate
2. **Browse Fixtures**: View upcoming football matches
3. **Place Bets**: Select a match and bet on the outcome
4. **Track Progress**: Monitor your bets in the profile section
5. **View Statistics**: Check your betting performance

### For Developers
1. **API Endpoints**: Each service exposes RESTful APIs
2. **Authentication**: JWT tokens for protected routes
3. **Database**: MongoDB with separate collections per service
4. **External APIs**: Integration with football data providers

## 🏛️ Project Requirements Compliance

This project meets all the requirements from the final project specification:

### ✅ Technical Requirements
- **Microservices Architecture**: 3 separate backend services
- **Database**: MongoDB only (multiple databases/collections)
- **Frontend**: React with full backend connectivity
- **Authentication**: Google OAuth + JWT implementation
- **Environment**: Proper .env usage across all services
- **API as a Service**: External football API integration
- **Error Handling**: Comprehensive error handling throughout

### ✅ API Paradigms (2+ implemented)
1. **RESTful APIs**: All services use REST principles
2. **OAuth 2.0**: Google OAuth for authentication
3. **JWT**: Token-based authentication for API access

### ✅ Core Features
- User authentication and profile management
- Real-time football fixture data
- Bet placement and tracking system
- Responsive web interface
- Data persistence and retrieval

## 🛠️ API Endpoints

### Main Service (3001)
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/profile` - Get user profile (JWT required)
- `GET /auth/external-api` - External API demo (JWT required)

### Betting Service (3002)
- `POST /api/bets` - Place a bet (JWT required)
- `GET /api/bets/user` - Get user's bets (JWT required)
- `GET /api/bets/:id` - Get specific bet (JWT required)

### Fixtures Service (3003)
- `GET /api/fixtures` - Get all fixtures
- `GET /api/fixtures/:id` - Get specific fixture
- `GET /api/fixtures/refresh` - Refresh from external API

## 🔧 Development

### File Structure
```
mini-betting-platform/
├── frontend/                 # React application
│   ├── public/
│   └── src/
│       ├── components/       # React components
│       ├── services/         # API service layer
│       └── App.js           # Main app component
├── backend/
│   ├── main-service/        # Authentication service
│   ├── betting-service/     # Betting logic service
│   └── fixtures-service/    # Fixtures data service
├── .env                     # Environment configuration
└── package.json            # Root package.json
```

### Testing
```bash
# Test individual services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Test authentication flow
# 1. Visit http://localhost:3000
# 2. Click "Continue with Google"
# 3. Complete OAuth flow
# 4. Access protected features
```

## 🔒 Security Features

- **OAuth 2.0**: Secure third-party authentication
- **JWT Tokens**: Stateless authentication
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Request data validation
- **Error Sanitization**: Safe error messages

## 📊 Database Schema

### Users Collection (main-service)
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,
  displayName: String,
  picture: String,
  createdAt: Date
}
```

### Bets Collection (betting-service)
```javascript
{
  _id: ObjectId,
  userId: String,
  fixtureId: String,
  betType: String, // 'home', 'away', 'draw'
  amount: Number,
  potentialWinning: Number,
  status: String, // 'pending', 'won', 'lost'
  createdAt: Date
}
```

### Fixtures Collection (fixtures-service)
```javascript
{
  _id: ObjectId,
  homeTeam: String,
  awayTeam: String,
  league: String,
  date: Date,
  status: String, // 'upcoming', 'live', 'finished'
  homeScore: Number,
  awayScore: Number,
  odds: {
    home: Number,
    draw: Number,
    away: Number
  }
}
```

## 🚀 Deployment

### Production Setup
1. Update environment variables for production
2. Configure MongoDB Atlas or production database
3. Set up Google OAuth for production domain
4. Deploy each service independently
5. Configure reverse proxy (nginx) for routing

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://yourdomain.com
MAIN_SERVICE_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google OAuth for authentication
- MongoDB for data storage
- React team for the frontend framework
- Football API providers for match data

---

**Note**: This is a demonstration project for educational purposes. Not intended for real money betting.
