const mongoose = require('mongoose');

// In-memory database fallback for demo purposes
let memoryDB = {
  bets: [],
  connected: false
};

const connectDB = async () => {
  try {
    // Try MongoDB connection first
    const mongoURI = process.env.MONGODB_URI || 'mongodb://bet_user:service123@localhost:27017/betting_bets?authSource=betting_bets';
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 5000,
      });
      console.log(`🗄️  Bet MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (mongoError) {
      console.log('📦 MongoDB not available for bet service, using in-memory storage for demo');
      
      // Initialize in-memory database
      memoryDB.connected = true;
      memoryDB.bets = [];
      
      console.log('💾 In-memory bet database initialized');
      console.log('🔧 All bet operations will use memory storage');
      return;
    }
  } catch (error) {
    console.error('❌ Bet Database connection error:', error.message);
    // Don't exit, fall back to in-memory
    memoryDB.connected = true;
    memoryDB.bets = [];
    console.log('💾 Falling back to in-memory bet storage');
  }
};

module.exports = { connectDB, memoryDB }; 