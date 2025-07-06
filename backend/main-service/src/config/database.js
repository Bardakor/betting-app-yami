const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use betting-mongodb for Docker network, localhost for local development
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    
    // Connect without authentication for local development
    const mongoURI = process.env.MONGODB_URI || `mongodb://${mongoHost}:27017/betting_main`;
    
    console.log(`🔗 Connecting to MongoDB: ${mongoHost}:27017/betting_main`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log(`🗄️  MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Please ensure MongoDB is running and accessible');
    process.exit(1);
  }
};

module.exports = { connectDB }; 