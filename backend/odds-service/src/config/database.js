const mongoose = require('mongoose');

const initDatabase = async () => {
  try {
    // Use betting-mongodb for Docker network, localhost for local development
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    
    // Connect without authentication for local development
    const mongoURI = process.env.MONGODB_URI || `mongodb://admin:password123@${mongoHost}:27017/betting_platform?authSource=admin`;
    
    console.log(`🔗 Connecting to MongoDB: ${mongoHost}:27017/betting_platform`);
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB (odds service)');
    console.log(`📊 MongoDB database initialized`);
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed for odds service:', error.message);
    console.error('💥 Odds service requires MongoDB to be running');
    process.exit(1);
  }
};

const getDatabase = () => {
  return mongoose.connection;
};

// Legacy compatibility functions for existing code
const dbGet = async (sql, params = []) => {
  console.warn('dbGet is deprecated, use MongoDB models instead');
  return null;
};

const dbAll = async (sql, params = []) => {
  console.warn('dbAll is deprecated, use MongoDB models instead');
  return [];
};

const dbRun = async (sql, params = []) => {
  console.warn('dbRun is deprecated, use MongoDB models instead');
  return { id: null, changes: 0 };
};

module.exports = {
  initDatabase,
  getDatabase,
  dbGet,
  dbAll,
  dbRun
}; 