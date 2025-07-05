# 🐳 Docker MongoDB Setup for Betting Platform

This guide explains how to set up MongoDB using Docker for the betting platform microservices.

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## 🚀 Quick Start

### 1. Start MongoDB with Docker Compose

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Verify MongoDB is Running

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec -it betting-mongodb mongosh --username admin --password password123 --authenticationDatabase admin
```

### 3. Start the Application Services

```bash
# In a new terminal, start all services
npm run dev
```

## 🗄️ Database Configuration

The setup creates the following databases with dedicated users:

- **betting_main** - Main service (users, auth)
- **betting_bets** - Bet service (bets, transactions) 
- **betting_wallet** - Wallet service (transactions, balances)
- **betting_results** - Result service (match results, settlements)

### Connection Strings

Each service uses authenticated connections:

```
Main Service:    mongodb://main_user:service123@localhost:27017/betting_main?authSource=betting_main
Bet Service:     mongodb://bet_user:service123@localhost:27017/betting_bets?authSource=betting_bets
Wallet Service:  mongodb://wallet_user:service123@localhost:27017/betting_wallet?authSource=betting_wallet
Result Service:  mongodb://result_user:service123@localhost:27017/betting_results?authSource=betting_results
```

## 🎛️ Mongo Express (Database Admin UI)

Access the MongoDB admin interface:

- **URL**: http://localhost:8081
- **No authentication required** (configured for development)

## 🔧 Management Commands

### Start Services
```bash
docker-compose up -d        # Start in background
docker-compose up           # Start with logs
```

### Stop Services
```bash
docker-compose down         # Stop and remove containers
docker-compose down -v      # Stop and remove volumes (deletes data)
```

### View Logs
```bash
docker-compose logs -f mongodb      # MongoDB logs
docker-compose logs -f mongo-express  # Mongo Express logs
```

### Reset Database
```bash
# Stop services and remove data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 📊 Service Status

Check if all services are healthy:

```bash
# MongoDB status
curl http://localhost:27017

# Service health checks
curl http://localhost:3001/health  # Main service
curl http://localhost:3004/health  # Wallet service  
curl http://localhost:3005/health  # Bet service
curl http://localhost:3006/health  # Result service
```

## 🛡️ Security Notes

⚠️ **Development Configuration Only**

This setup is configured for development with:
- Simple passwords
- No authentication for Mongo Express
- Default ports exposed

For production, ensure you:
- Use strong passwords
- Enable authentication for all UIs
- Use secure connection strings
- Configure firewall rules

## 🐛 Troubleshooting

### MongoDB Won't Start
```bash
# Check if port 27017 is already in use
lsof -i :27017

# View detailed logs
docker-compose logs mongodb
```

### Connection Refused Errors
```bash
# Ensure MongoDB is running
docker-compose ps

# Restart if needed
docker-compose restart mongodb
```

### Services Fall Back to In-Memory
This is normal behavior when MongoDB is not available. Services will automatically use in-memory storage and display:
```
📦 MongoDB not available, using in-memory storage for demo
```

### Reset Everything
```bash
# Nuclear option - removes all containers and data
docker-compose down -v
docker system prune -f
docker-compose up -d
```

## 📈 Production Considerations

For production deployment:

1. **Use MongoDB Atlas** or managed MongoDB service
2. **Configure replica sets** for high availability  
3. **Enable authentication** and SSL/TLS
4. **Set up monitoring** and alerts
5. **Configure backups** and disaster recovery
6. **Use environment variables** for sensitive data

## 🔗 Related Files

- `docker-compose.yml` - Docker services configuration
- `mongo-init.js` - Database initialization script
- `backend/*/env.example` - Environment variable templates

## 💡 Tips

- MongoDB data persists between container restarts
- Use `docker-compose down -v` only if you want to delete all data
- Mongo Express provides an easy way to browse and edit data
- Services will fall back to in-memory storage if MongoDB is unavailable 