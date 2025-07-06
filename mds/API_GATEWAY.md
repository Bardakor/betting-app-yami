# Elite Betting Platform API Gateway

## Overview

The API Gateway serves as the central entry point for all microservices in the Elite Betting Platform. It provides:

- **Request Routing**: Routes requests to appropriate microservices
- **Load Balancing**: Distributes load across service instances
- **Authentication**: Handles authentication and authorization
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Health Monitoring**: Monitors the health of all services
- **API Documentation**: Provides comprehensive API documentation
- **CORS Handling**: Manages cross-origin requests

## Quick Start

### Starting the Platform

```bash
# Start all services (including API Gateway)
./start_all.sh

# Stop all services
./stop_all.sh

# Clean up everything
./clean_all.sh
```

### Access Points

- **Frontend Application**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Test Interface**: Open `api-test-interface.html` in your browser

## API Gateway Endpoints

### Health & Monitoring

- `GET /health` - Gateway health status
- `GET /health/services` - All services health status
- `GET /test` - Test endpoint with service information

### Service Proxies

All API requests are routed through the gateway:

- `GET|POST|PUT|DELETE /api/auth/*` → Main Service (Port 3001)
- `GET|POST|PUT|DELETE /api/users/*` → Main Service (Port 3001)
- `GET|POST|PUT|DELETE /api/fixtures/*` → Fixtures Service (Port 3002)
- `GET|POST|PUT|DELETE /api/odds/*` → Odds Service (Port 3003)
- `GET|POST|PUT|DELETE /api/wallet/*` → Wallet Service (Port 3004)
- `GET|POST|PUT|DELETE /api/bets/*` → Bet Service (Port 3005)
- `GET|POST|PUT|DELETE /api/results/*` → Result Service (Port 3006)

### Documentation

- `GET /docs` - Interactive Swagger API documentation

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │
│  (Port 3000)    │◄──►│  (Port 8000)    │
└─────────────────┘    └─────────┬───────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
         ┌───────▼───────┐ ┌─────▼─────┐ ┌─────▼─────┐
         │ Main Service  │ │ Fixtures  │ │   Odds    │
         │ (Port 3001)   │ │(Port 3002)│ │(Port 3003)│
         └───────────────┘ └───────────┘ └───────────┘
                 
         ┌───────────────┐ ┌───────────┐ ┌───────────┐
         │    Wallet     │ │   Bets    │ │  Results  │
         │ (Port 3004)   │ │(Port 3005)│ │(Port 3006)│
         └───────────────┘ └───────────┘ └───────────┘
```

## Features

### 🔒 Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Request validation

### 🚀 Performance
- HTTP proxy middleware for efficient routing
- Connection pooling
- Request/response compression

### 📊 Monitoring
- Health checks for all services
- Service status monitoring
- Request logging
- Error tracking

### 📚 Documentation
- Auto-generated Swagger documentation
- Interactive API testing interface
- Service endpoint mapping

## Environment Configuration

Create a `.env` file in the API Gateway directory:

```env
PORT=8000
NODE_ENV=development

# Service URLs
MAIN_SERVICE_URL=http://localhost:3001
FIXTURES_SERVICE_URL=http://localhost:3002
ODDS_SERVICE_URL=http://localhost:3003
WALLET_SERVICE_URL=http://localhost:3004
BET_SERVICE_URL=http://localhost:3005
RESULT_SERVICE_URL=http://localhost:3006

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Testing the API

### Using the Test Interface

1. Open `api-test-interface.html` in your browser
2. Click on any endpoint to test it
3. View real-time service status
4. See formatted responses

### Using curl

```bash
# Test gateway health
curl http://localhost:8000/health

# Test services health
curl http://localhost:8000/health/services

# Test an API endpoint
curl http://localhost:8000/api/fixtures

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/bets
```

### Using the Swagger UI

1. Visit http://localhost:8000/docs
2. Explore all available endpoints
3. Try out requests directly in the browser
4. View request/response schemas

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   ```bash
   # Check if port is in use
   lsof -i :8000
   
   # Kill process if needed
   lsof -ti:8000 | xargs kill -9
   ```

2. **Service Health Check Failing**
   ```bash
   # Check individual service
   curl http://localhost:3001/health
   
   # Check logs
   tail -f logs/gateway.log
   ```

3. **CORS Issues**
   - Ensure `CORS_ORIGIN` is set correctly
   - Check that frontend URL matches configuration

### Logs

All logs are stored in the `logs/` directory:

- `gateway.log` - API Gateway logs
- `main.log` - Main service logs
- `fixtures.log` - Fixtures service logs
- `odds.log` - Odds service logs
- `wallet.log` - Wallet service logs
- `bet.log` - Bet service logs
- `result.log` - Result service logs
- `frontend.log` - Frontend logs

```bash
# View all logs
tail -f logs/*.log

# View specific service log
tail -f logs/gateway.log
```

## Development

### Adding New Services

1. Add the service to the gateway configuration
2. Update the proxy routes in `src/index.js`
3. Add health check for the new service
4. Update documentation

### Modifying Routes

Edit `backend/api-gateway/src/index.js` to:
- Add new proxy routes
- Modify existing routes
- Add middleware
- Update health checks

## Production Deployment

### Environment Variables

Set production environment variables:

```env
NODE_ENV=production
PORT=8000
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=1000
```

### Docker Support

The API Gateway can be containerized with Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 8000
CMD ["npm", "start"]
```

### Load Balancing

For production, consider:
- Multiple gateway instances
- Load balancer (nginx, HAProxy)
- Service discovery
- Circuit breaker pattern

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License.
