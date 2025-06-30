const mongoose = require('mongoose');

// In-memory database fallback for demo purposes
let memoryDB = {
  users: [],
  connected: false
};

const connectDB = async () => {
  try {
    // Try MongoDB connection first
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/betting_app';
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000, // 3 second timeout
        connectTimeoutMS: 3000,
      });
      console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (mongoError) {
      console.log('📦 MongoDB not available, using in-memory storage for demo');
      
      // Initialize in-memory database with admin user
      memoryDB.connected = true;
      memoryDB.users = [
        {
          _id: 'admin123',
          email: 'admin@admin.com',
          password: '$2b$10$rGk5D8oOAc8zR6YU4QXfgOH.RjY2mR8vCyJx8s9Uq0.WzR7Nv8Zre', // admin123
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          balance: 1000,
          stats: {
            totalBets: 0,
            wonBets: 0,
            lostBets: 0,
            pendingBets: 0,
            totalWinnings: 0,
            totalLosses: 0
          },
          createdAt: new Date(),
          lastLogin: new Date()
        }
      ];
      
      console.log('✅ In-memory database initialized with admin user');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Export memory database for use in routes
module.exports = { connectDB, memoryDB }; 