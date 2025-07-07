const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use betting-mongodb for Docker network, localhost for local development
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    
    // Connect without authentication for local development
    const mongoURI = process.env.MONGODB_URI || `mongodb://admin:password123@${mongoHost}:27017/betting_platform?authSource=admin`;
    
    console.log(`🔗 Connecting to MongoDB: ${mongoHost}:27017/betting_platform`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log(`🗄️  Result MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Result Database connection error:', error.message);
    console.error('💥 Result service requires MongoDB to be running');
    process.exit(1);
  }
};

module.exports = { connectDB }; 