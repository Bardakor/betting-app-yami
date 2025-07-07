const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const userDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-betting-platform-users';
    
    console.log('Connecting to MongoDB (Users DB):', userDbUri);
    
    const conn = await mongoose.connect(userDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected (Users DB): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
