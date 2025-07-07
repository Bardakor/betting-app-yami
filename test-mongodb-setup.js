#!/usr/bin/env node

const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');

// MongoDB connection string for Docker setup
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/betting_platform?authSource=admin';

async function testMongoConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Test database access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Test a simple query
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    const betsCount = await mongoose.connection.db.collection('bets').countDocuments();
    console.log(`👥 Users in database: ${usersCount}`);
    console.log(`🎰 Bets in database: ${betsCount}`);
    
    console.log('\n🎉 MongoDB setup is working perfectly!');
    console.log('🌐 Mongo Express: http://localhost:8081');
    console.log('💾 MongoDB: mongodb://localhost:27017');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Docker is running');
    console.log('2. Run: docker-compose up -d');
    console.log('3. Wait for MongoDB to initialize');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Disconnected from MongoDB');
  }
}

testMongoConnection();