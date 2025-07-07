const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const bettingDbUri = process.env.MONGODB_URI?.replace('/mini-betting-platform-users', '/mini-betting-platform-betting') 
      || 'mongodb://localhost:27017/mini-betting-platform-betting';
    
    console.log('Connecting to MongoDB (Betting DB):', bettingDbUri);
    
    const conn = await mongoose.connect(bettingDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected (Betting DB): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
