const mongoose = require('mongoose');

const initDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odds_service';
    
    // Force connection failure for demo purposes to use in-memory fallback
    if (process.env.FORCE_MEMORY_DB === 'true') {
      throw new Error('Forced to use in-memory database for demo');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB (odds service)');
    return true;
    
  } catch (error) {
    console.log('❌ MongoDB connection failed, using in-memory database for demo');
    console.log('MongoDB Error:', error.message);
    return false;
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