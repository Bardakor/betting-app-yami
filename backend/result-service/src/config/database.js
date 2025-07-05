const mongoose = require('mongoose');

// In-memory database fallback for demo purposes
let memoryDB = {
  results: [],
  connected: false
};

const connectDB = async () => {
  try {
    // Try MongoDB connection first
    const mongoURI = process.env.MONGODB_URI || 'mongodb://result_user:service123@localhost:27017/betting_results?authSource=betting_results';
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 5000,
      });
      console.log(`🗄️  Result MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (mongoError) {
      console.log('📦 MongoDB not available for result service, using in-memory storage for demo');
      
      // Initialize in-memory database
      memoryDB.connected = true;
      memoryDB.results = [];
      
      console.log('💾 In-memory result database initialized');
      console.log('🔧 All result operations will use memory storage');
      return;
    }
  } catch (error) {
    console.error('❌ Result Database connection error:', error.message);
    // Don't exit, fall back to in-memory
    memoryDB.connected = true;
    memoryDB.results = [];
    console.log('💾 Falling back to in-memory result storage');
  }
};

module.exports = { connectDB, memoryDB }; 