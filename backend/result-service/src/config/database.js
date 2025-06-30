const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`💾 Result MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('💥 Result Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 