const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const fixturesDbUri = process.env.MONGODB_URI?.replace('/mini-betting-platform-users', '/mini-betting-platform-fixtures') 
      || 'mongodb://localhost:27017/mini-betting-platform-fixtures';
    
    console.log('Connecting to MongoDB (Fixtures DB):', fixturesDbUri);
    
    const conn = await mongoose.connect(fixturesDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected (Fixtures DB): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
