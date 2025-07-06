# 🧭 MongoDB GUI Setup & Usage Guide

## ✅ **Status: FIXED! Mongo Express is now working**

### 🌐 **Mongo Express (Web-based GUI)**
- **URL**: http://localhost:8081
- **Status**: ✅ Running and connected
- **Access**: No authentication required

### 🎯 **What You Can Do Now:**

1. **Browse Databases**
   - Click on `betting_platform` database
   - Explore your collections

2. **View Collections**
   - `users` - User accounts and profiles
   - `bets` - All betting records
   - `transactions` - Financial operations
   - `processed_results` - Match results

3. **Query Data**
   - Find users: `{"role": "admin"}`
   - Recent bets: `{"createdAt": {"$gte": new Date("2024-01-01")}}`
   - High transactions: `{"amount": {"$gt": 100}}`

4. **Edit Documents** (be careful!)
   - Click on any document to modify it
   - Add/remove fields
   - Update values

---

## 🛠️ **Troubleshooting: What Was Fixed**

### ❌ **Previous Error:**
```
MongoServerSelectionError: getaddrinfo ENOTFOUND mongodb
```

### ✅ **Root Cause:**
- Multiple MongoDB containers running independently
- Containers not on the same Docker network
- Mongo Express couldn't find the MongoDB hostname

### 🔧 **Solution Applied:**
1. **Cleaned up** all old/conflicting containers
2. **Restarted** Docker Compose with proper networking
3. **Ensured** containers are on the same `betting-network`
4. **Verified** MongoDB starts before Mongo Express

---

## 🖥️ **Alternative: MongoDB Compass (Desktop GUI)**

If you want a more powerful desktop tool:

### 📦 **Installation:**
```bash
# macOS (Homebrew)
brew install mongodb-compass

# Or download from: https://www.mongodb.com/try/download/compass
```

### 🔗 **Connection Details:**
```
Connection String: mongodb://admin:password123@localhost:27017/?authSource=admin
```

### ✨ **Compass Features:**
- Visual query builder
- Real-time performance monitoring
- Index management and optimization
- Schema visualization
- Aggregation pipeline builder

---

## 🎯 **Quick Start Commands**

### Start MongoDB + Mongo Express:
```bash
docker-compose up -d mongodb mongo-express
```

### Stop everything:
```bash
docker-compose down
```

### Check logs:
```bash
docker logs betting-mongodb
docker logs betting-mongo-express
```

### Check container status:
```bash
docker ps | grep mongo
```

---

## 🎉 **Ready to Explore!**

✅ **Mongo Express**: http://localhost:8081
✅ **MongoDB Direct**: localhost:27017 (for Compass)
✅ **Collections**: users, bets, transactions, processed_results

Your MongoDB GUI is now working perfectly! 🚀
