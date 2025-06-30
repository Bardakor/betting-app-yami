const mongoose = require('mongoose');

// In-memory database fallback for demo purposes
let memoryDB = {
  transactions: [],
  connected: false
};

const connectDB = async () => {
  try {
    // Try MongoDB connection first
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/betting_wallet';
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000, // 3 second timeout
        connectTimeoutMS: 3000,
      });
      console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (mongoError) {
      console.log('📦 MongoDB not available, using in-memory storage for demo');
      
      // Initialize in-memory database
      memoryDB.connected = true;
      memoryDB.transactions = [];
      
      console.log('💾 In-memory wallet database initialized');
      console.log('🔧 All wallet operations will use memory storage');
      return;
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, memoryDB }; 