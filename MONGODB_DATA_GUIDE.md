# 🎯 MongoDB Mock Data Exploration Guide

## 🎉 **SUCCESS! Your database is now populated with comprehensive mock data!**

### 📊 **Data Summary:**
- **👥 Users**: 5 accounts (1 admin + 4 regular users)
- **🎰 Bets**: 6 betting records (pending, won, lost)
- **💰 Transactions**: 6 financial operations (deposits, withdrawals, settlements)
- **⚽ Fixtures**: 3 football matches (scheduled & finished)
- **📈 Results**: 1 processed match result
- **📊 Stats**: System analytics and performance metrics

---

## 🌐 **Explore Your Data in Mongo Express**

### **Access**: http://localhost:8081

### **Step-by-Step Guide:**

1. **Open the Database**
   - Click on `betting_platform` database
   - See all collections with document counts

2. **Explore Collections:**

#### 👥 **Users Collection**
```javascript
// Sample users to explore:
- admin@admin.com (Admin user, €100,000 balance)
- john.doe@example.com (Regular user, €1,250.75 balance)
- marie.martin@example.fr (French user, €450.30 balance)
- carlos.rodriguez@example.es (Spanish user, €2,750.00 balance)
- emma.wilson@example.co.uk (UK user, €175.50 balance)
```

#### 🎰 **Bets Collection**
```javascript
// Interesting queries to try:
{"status": "pending"}     // See upcoming bets
{"status": "won"}         // See winning bets
{"betType": "match_winner"} // See match winner bets
{"stake": {"$gt": 50}}    // See high-stake bets
```

#### 💰 **Transactions Collection**
```javascript
// Useful queries:
{"type": "deposit"}       // See all deposits
{"type": "withdrawal"}    // See withdrawals
{"status": "pending"}     // See pending transactions
{"amount": {"$gt": 100}}  // See large transactions
```

#### ⚽ **Fixtures Collection**
```javascript
// Explore matches:
{"status": "scheduled"}   // Upcoming matches
{"status": "finished"}    // Completed matches
{"league.name": "Premier League"} // Premier League matches
```

---

## 🔍 **Sample Queries to Try**

### **Find All Admin Users:**
```javascript
{"role": "admin"}
```

### **Find Recent Bets (Last 7 Days):**
```javascript
{"placedAt": {"$gte": new Date("2024-12-13")}}
```

### **Find High-Value Deposits:**
```javascript
{"type": "deposit", "amount": {"$gt": 200}}
```

### **Find Winning Bets:**
```javascript
{"status": "won", "payout": {"$exists": true}}
```

### **Find Users with High Balances:**
```javascript
{"balance": {"$gt": 1000}}
```

---

## 📊 **Key Data Relationships**

### **User → Bets Relationship:**
- Each bet has a `userId` linking to the users collection
- Users have betting statistics in their `stats` object

### **Bet → Transaction Relationship:**
- Each bet placement creates a transaction record
- Bet settlements create additional transaction records

### **Fixture → Bet Relationship:**
- Bets reference fixtures via `fixtureId`
- Fixtures contain teams, odds, and match information

### **Result → Settlement Relationship:**
- Processed results trigger bet settlements
- Results contain payout calculations and statistics

---

## 🎮 **Realistic Test Scenarios**

### **Scenario 1: New User Journey**
1. Check `emma.wilson@example.co.uk` (newest user)
2. See her limited betting history
3. Notice her unverified status

### **Scenario 2: High Roller Analysis**
1. Explore `carlos.rodriguez@example.es`
2. See his 67 total bets and €2,750 balance
3. Check his transaction history

### **Scenario 3: Match Settlement**
1. Look at fixture `868551` (PSG vs Lille)
2. Find related bets in the bets collection
3. See the processed result and payouts

### **Scenario 4: Admin Operations**
1. Check admin user's massive balance
2. See admin adjustment transactions
3. Explore system-wide statistics

---

## 🔐 **Authentication Test Data**

### **Admin Login:**
- **Email**: `admin@admin.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Balance**: €100,000

### **Test User Login:**
- **Email**: `john.doe@example.com`
- **Password**: `password123` (all users use same test password)
- **Role**: `user`
- **Balance**: €1,250.75

---

## 📈 **Business Intelligence Queries**

### **Popular Bet Types:**
```javascript
// Aggregate by bet type
db.bets.aggregate([
  {"$group": {"_id": "$betType", "count": {"$sum": 1}}},
  {"$sort": {"count": -1}}
])
```

### **Total Platform Revenue:**
```javascript
// Sum all deposits minus withdrawals
db.transactions.aggregate([
  {"$group": {
    "_id": "$type",
    "total": {"$sum": "$amount"}
  }}
])
```

### **User Activity Analysis:**
```javascript
// Users by bet count
db.users.find({}, {"firstName": 1, "lastName": 1, "stats.totalBets": 1})
  .sort({"stats.totalBets": -1})
```

---

## 🎉 **Ready for Demonstration!**

Your MongoDB database now contains:
- ✅ **Realistic user profiles** with varying balances and betting patterns
- ✅ **Diverse betting scenarios** (pending, won, lost bets)
- ✅ **Complete financial records** (deposits, withdrawals, settlements)
- ✅ **Live sports data** (fixtures with real team names and leagues)
- ✅ **Performance analytics** (system statistics and metrics)
- ✅ **Proper indexing** for optimal query performance

Perfect for showcasing your enterprise-grade sports betting platform! 🚀

**Access Mongo Express**: http://localhost:8081
**Explore, query, and demonstrate all the rich data relationships!**
