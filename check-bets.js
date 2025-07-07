const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    const mongoURI = process.env.MONGODB_URI || `mongodb://${mongoHost}:27017/betting_main`;
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkBets = async () => {
  try {
    console.log('\n🔍 CHECKING BETS COLLECTION...');
    console.log('=' * 50);
    
    // Get raw collection
    const db = mongoose.connection.db;
    const betsCollection = db.collection('bets');
    
    // Count documents
    const count = await betsCollection.countDocuments();
    console.log(`📊 Total documents in bets collection: ${count}`);
    
    // Get all documents
    const bets = await betsCollection.find({}).toArray();
    console.log(`📋 Found ${bets.length} bets`);
    
    if (bets.length > 0) {
      console.log('\n📝 BET DETAILS:');
      console.log('-' * 50);
      
      bets.forEach((bet, index) => {
        console.log(`\n🎯 BET ${index + 1}:`);
        console.log(`   _id: ${bet._id}`);
        console.log(`   betId: ${bet.betId || 'N/A'}`);
        console.log(`   userId: ${bet.userId || 'N/A'}`);
        console.log(`   status: ${bet.status || 'N/A'}`);
        console.log(`   betType: ${bet.betType || 'N/A'}`);
        console.log(`   selection: ${bet.selection || 'N/A'}`);
        console.log(`   amount: $${bet.amount || 'N/A'}`);
        console.log(`   odds: ${bet.odds || 'N/A'}`);
        console.log(`   potentialWinnings: $${bet.potentialWinnings || 'N/A'}`);
        console.log(`   placedAt: ${bet.placedAt || 'N/A'}`);
        console.log(`   createdAt: ${bet.createdAt || 'N/A'}`);
        console.log(`   updatedAt: ${bet.updatedAt || 'N/A'}`);
        
        if (bet.fixture) {
          console.log(`   fixture:`);
          console.log(`      id: ${bet.fixture.id || 'N/A'}`);
          console.log(`      date: ${bet.fixture.date || 'N/A'}`);
          console.log(`      homeTeam: ${bet.fixture.homeTeam?.name || 'N/A'}`);
          console.log(`      awayTeam: ${bet.fixture.awayTeam?.name || 'N/A'}`);
          console.log(`      league: ${bet.fixture.league?.name || 'N/A'}`);
        }
        
        console.log(`   Raw document:`, JSON.stringify(bet, null, 2));
      });
    } else {
      console.log('\n❌ No bets found in collection');
    }
    
    // Check users with bet stats
    const usersCollection = db.collection('users');
    const usersWithBets = await usersCollection.find({
      'stats.totalBets': { $gt: 0 }
    }).toArray();
    
    console.log(`\n👥 Users with betting activity: ${usersWithBets.length}`);
    usersWithBets.forEach((user, index) => {
      console.log(`\n🧑 USER ${index + 1}:`);
      console.log(`   _id: ${user._id}`);
      console.log(`   name: ${user.firstName} ${user.lastName}`);
      console.log(`   email: ${user.email}`);
      console.log(`   balance: $${user.balance || 0}`);
      console.log(`   stats: ${JSON.stringify(user.stats, null, 2)}`);
    });
    
    // List all collections
    console.log('\n🗃️ ALL COLLECTIONS:');
    console.log('-' * 30);
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking bets:', error);
  }
};

const run = async () => {
  await connectDB();
  await checkBets();
  process.exit(0);
};

run().catch(console.error);