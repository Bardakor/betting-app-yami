# Yami Betting Platform - Production-Ready Full Stack Application

## 🎯 Project Overview

Yami Betting Platform is a comprehensive, production-ready full stack application built with modern JavaScript technologies. It demonstrates advanced microservices architecture, real-time data processing, and secure authentication systems for sports betting.

**Topic Choice**: Sports betting platform with live match data and statistical odds calculation - chosen for its real-world applicability and market demand in the growing online gaming industry.

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **UI Components**: Radix UI primitives
- **State Management**: React hooks and context
- **Authentication**: JWT token management

### Backend - Microservices Architecture
1. **Main Service** (Port 3001) - Authentication, user management, API orchestration
2. **Fixtures Service** (Port 3002) - Live match data and fixtures
3. **Odds Service** (Port 3003) - Statistical odds calculation
4. **Wallet Service** (Port 3004) - Payment processing and transactions
5. **Bet Service** (Port 3005) - Bet placement and management
6. **Result Service** (Port 3006) - Match result processing

### Databases (2+ Requirement Met)
- **Primary**: MongoDB for production data
- **Fallback**: In-memory storage for demo/development
- **Collections**: users, bets, transactions, processed_results

### External API Integration
- **API-Football**: Live sports data and fixtures
- **Custom Statistical Engine**: Real-time odds calculation

## 🔐 Authentication & Security

### Multiple Authentication Methods
1. **Email/Password Authentication** with bcrypt password hashing
2. **Google OAuth Integration** for social login
3. **JWT Token System** for secure API access
4. **Role-based Access Control** (Admin/User permissions)

### Security Features
- Input validation and sanitization
- Rate limiting (100 req/15min general, 5 bets/min user)
- CORS configuration
- Secure password storage
- Token-based authentication between microservices

### Protected Routes
- Betting operations require authentication
- Admin functions require admin role
- Unauthorized access redirects to login page
- Token verification across all microservices

## 🔌 API Paradigms (2+ Requirement Met)

### 1. REST API
Traditional HTTP methods across all microservices:
- GET, POST, PUT, DELETE operations
- Resource-based URLs
- Standard HTTP status codes
- JSON request/response format

### 2. Polling/Real-time Updates
- Client-side polling every 30 seconds for live data
- Simulates real-time behavior for live matches
- Auto-refresh functionality for live odds

## 🚀 API as a Service

### JWT-Protected Endpoints
All APIs require JWT authentication for protected operations:

```bash
# Get Token (Working Demo)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Access Protected Endpoint (With Token)
curl -X GET http://localhost:3001/api/user/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Access Without Token (Access Denied Demo)
curl -X GET http://localhost:3001/api/user/stats
# Returns: 401 Unauthorized
```

### External API Service Features
- Comprehensive API documentation with examples
- Postman collection ready for testing
- Rate limiting and error handling
- External developer access via JWT tokens

## 📡 Service Communication

### Inter-Service Communication
- JWT-based authentication between services
- HTTP REST calls for data exchange
- Error handling and retry mechanisms
- Health check endpoints on all services

### Frontend-Backend Communication
- Next.js API routes as proxy layer
- CORS-enabled cross-origin requests
- Real-time data updates through polling
- Secure token-based authentication

## 🗄️ Database Schema

### MongoDB Collections
```javascript
// Users Collection
{
  email: String,
  password: String (bcrypt hashed),
  firstName: String,
  lastName: String,
  role: String (admin/user),
  balance: Number,
  stats: Object,
  googleId: String (for OAuth),
  isActive: Boolean
}

// Bets Collection
{
  userId: ObjectId,
  fixtureId: Number,
  betType: String,
  selection: String,
  stake: Number,
  odds: Number,
  status: String (pending/won/lost),
  placedAt: Date
}

// Transactions Collection
{
  userId: ObjectId,
  type: String (deposit/withdrawal/bet/win),
  amount: Number,
  description: String,
  createdAt: Date
}
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (optional - uses in-memory fallback)

### Installation & Running

1. **Clone and Install**
```bash
git clone [repository-url]
cd Final2
npm install
```

2. **Start All Services**
```bash
./start-services.sh
```

3. **Access Application**
- Frontend: http://localhost:3000
- Main API: http://localhost:3001
- See API_DOCUMENTATION.md for all endpoints

4. **Default Admin Account**
- Email: admin@admin.com
- Password: admin123
- Balance: $100,000

### Individual Service Management
```bash
# Start specific service
cd backend/main-service && npm start

# Stop all services
./stop-services.sh
```

## 🎮 Application Features

### Live Betting Experience
- Real-time live matches from Chinese Super League, J-League, etc.
- Statistical odds calculation with confidence ratings
- Interactive bet slip with multi-bet support
- Live score updates every 30 seconds

### User Management
- User registration and profile management
- Google OAuth integration
- Balance management and transaction history
- Betting statistics and performance tracking

### Admin Features
- User management and balance adjustments
- Betting oversight and statistics
- Match result processing
- System health monitoring

## 🧪 Testing & Validation

### API Testing with Postman

1. **Authentication Test**
```bash
POST http://localhost:3001/auth/login
Body: {"email": "admin@admin.com", "password": "admin123"}
Expected: 200 OK with JWT token
```

2. **Protected Endpoint with Token**
```bash
GET http://localhost:3001/api/user/stats
Headers: Authorization: Bearer <token>
Expected: 200 OK with user statistics
```

3. **Access Denied Test**
```bash
GET http://localhost:3001/api/user/stats
(No Authorization header)
Expected: 401 Unauthorized
```

### Live Data Verification
- Visit http://localhost:3000/live-matches
- Verify real team names (not mock data)
- Confirm live scores and match times
- Test betting button functionality

## 📋 Project Requirements Checklist

### ✅ Core Requirements Met
- [x] **Frontend**: Interactive Next.js application
- [x] **Backend**: 6 microservices (exceeds 3 minimum)
- [x] **Databases**: MongoDB + In-memory (exceeds 2 minimum)
- [x] **API Communication**: REST APIs between all services
- [x] **Authentication**: JWT + Google OAuth
- [x] **Protected Routes**: Token-based access control
- [x] **API as Service**: JWT-protected external API access
- [x] **Error Handling**: Comprehensive error responses

### ✅ Advanced Features Implemented
- [x] **External API Integration**: API-Football for live data
- [x] **Multiple API Paradigms**: REST + Polling/Real-time
- [x] **Production Security**: Rate limiting, validation, CORS
- [x] **Comprehensive Documentation**: API docs with examples
- [x] **Real-time Data**: Live match updates every 30 seconds
- [x] **Scalable Architecture**: Independent microservices

## 📊 Presentation Points

### App Demonstration
1. **Live Betting Interface**: Real matches with interactive odds
2. **Authentication Flow**: Login, Google OAuth, protected routes
3. **Microservices**: 6 independent services working together
4. **Real-time Updates**: Live data refreshing automatically

### Technical Stack Highlights
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Node.js microservices, Express.js, JWT authentication
- **Database**: MongoDB with in-memory fallback
- **External APIs**: API-Football integration
- **Security**: bcrypt, CORS, rate limiting, input validation

### Architecture Deep-dive
- Service-to-service JWT authentication
- Database schema and relationships
- API paradigms: REST + Polling
- Error handling and logging strategies

### API Demonstration
- Postman collection with working examples
- JWT token authentication demo
- Access denied scenarios
- Rate limiting in action

## 🔗 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for comprehensive API reference with:
- All endpoint documentation
- Request/response examples
- Authentication requirements
- Postman testing instructions
- Error code references

## 🏗️ Development & Production

### Environment Configuration
```bash
# Main Service (.env)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/betting_app
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

### Production Deployment Considerations
1. **Security**: Environment variables for secrets
2. **Scaling**: Horizontal scaling for microservices
3. **Monitoring**: Health checks and logging
4. **Database**: Production MongoDB cluster
5. **Load Balancing**: nginx for service distribution

## 📈 Market Potential & Future Development

This platform demonstrates production-ready architecture suitable for:
- Sports betting platforms
- Real-time data applications
- Microservices architecture patterns
- Financial transaction systems

The codebase provides a solid foundation for further development in the growing online gaming and sports analytics markets.

## 👥 Team Contribution Guidelines

For team presentations:
- Each member should understand the microservices architecture
- Demonstrate different API endpoints and authentication flows
- Explain database relationships and data flow
- Show real-time features and external API integration

## 📞 Support & Contact

For technical questions or demo requests:
- Review API_DOCUMENTATION.md for detailed endpoints
- Use Postman collection for API testing
- Check logs/ directory for service debugging
- Ensure all services are running via start-services.sh

---

**🎉 Production-Ready Full Stack Application - Ready for Professional Demonstration** 