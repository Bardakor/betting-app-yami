const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`💾 Bet MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('💥 Bet Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 