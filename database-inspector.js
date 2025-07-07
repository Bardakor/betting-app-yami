const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
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
    console.log('=' * 60);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// User Schema (simplified for inspection)
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  googleId: String,
  avatar: String,
  balance: Number,
  stats: {
    totalBets: Number,
    wonBets: Number,
    lostBets: Number,
    pendingBets: Number,
    totalWinnings: Number,
    totalLosses: Number,
    highestWin: Number,
    currentStreak: Number,
    longestWinStreak: Number
  },
  preferences: {
    currency: String,
    timezone: String,
    favoriteLeagues: [Number],
    favoriteTeams: [Number],
    notifications: {
      email: Boolean,
      betUpdates: Boolean,
      promotions: Boolean
    }
  },
  isActive: Boolean,
  emailVerified: Boolean,
  lastLogin: Date,
  dailyBetLimit: Number,
  weeklyBetLimit: Number,
  monthlyBetLimit: Number
}, { timestamps: true });

// Bet Schema (simplified for inspection)
const betSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  betId: String,
  fixture: {
    id: Number,
    date: Date,
    homeTeam: {
      id: Number,
      name: String,
      logo: String
    },
    awayTeam: {
      id: Number,
      name: String,
      logo: String
    },
    league: {
      id: Number,
      name: String,
      logo: String,
      country: String
    },
    venue: {
      name: String,
      city: String
    }
  },
  betType: String,
  selection: String,
  parameters: {
    value: Number,
    player: {
      id: Number,
      name: String
    },
    score: {
      home: Number,
      away: Number
    }
  },
  amount: Number,
  odds: Number,
  potentialWinnings: Number,
  status: String,
  result: {
    actualOutcome: String,
    correctPrediction: Boolean,
    finalScore: {
      home: Number,
      away: Number
    },
    matchStatus: String,
    settledAt: Date,
    settledBy: String
  },
  oddsInfo: {
    bookmaker: String,
    market: String,
    openingOdds: Number,
    closingOdds: Number,
    maxOdds: Number,
    minOdds: Number,
    oddsMovement: String
  },
  placedAt: Date,
  ipAddress: String,
  userAgent: String,
  isLiveBet: Boolean,
  liveData: {
    minute: Number,
    score: {
      home: Number,
      away: Number
    },
    events: [String]
  },
  cashout: {
    available: Boolean,
    value: Number,
    multiplier: Number
  },
  notes: String,
  tags: [String],
  riskLevel: String,
  analytics: {
    confidence: Number,
    expectedValue: Number,
    kellyPercentage: Number,
    valueRating: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Bet = mongoose.model('Bet', betSchema);

// Helper function to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A';
  return `$${amount.toFixed(2)}`;
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

// Helper function to calculate win rate
const calculateWinRate = (won, total) => {
  if (total === 0) return '0%';
  return `${((won / total) * 100).toFixed(1)}%`;
};

// Main inspection function
const inspectDatabase = async () => {
  try {
    console.log('\n🔍 DATABASE INSPECTION REPORT');
    console.log('=' * 60);
    
    // Get all users
    const users = await User.find({}).lean();
    console.log(`\n👥 TOTAL USERS: ${users.length}`);
    console.log('=' * 60);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`\n📋 USER ${index + 1}:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Google ID: ${user.googleId || 'N/A'}`);
        console.log(`   Balance: ${formatCurrency(user.balance)}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   Last Login: ${formatDate(user.lastLogin)}`);
        console.log(`   Created: ${formatDate(user.createdAt)}`);
        console.log(`   Updated: ${formatDate(user.updatedAt)}`);
        
        if (user.stats) {
          console.log(`   📊 BETTING STATS:`);
          console.log(`      Total Bets: ${user.stats.totalBets || 0}`);
          console.log(`      Won Bets: ${user.stats.wonBets || 0}`);
          console.log(`      Lost Bets: ${user.stats.lostBets || 0}`);
          console.log(`      Pending Bets: ${user.stats.pendingBets || 0}`);
          console.log(`      Win Rate: ${calculateWinRate(user.stats.wonBets, user.stats.totalBets)}`);
          console.log(`      Total Winnings: ${formatCurrency(user.stats.totalWinnings)}`);
          console.log(`      Total Losses: ${formatCurrency(user.stats.totalLosses)}`);
          console.log(`      Highest Win: ${formatCurrency(user.stats.highestWin)}`);
          console.log(`      Current Streak: ${user.stats.currentStreak || 0}`);
          console.log(`      Longest Win Streak: ${user.stats.longestWinStreak || 0}`);
        }
        
        if (user.preferences) {
          console.log(`   ⚙️ PREFERENCES:`);
          console.log(`      Currency: ${user.preferences.currency || 'USD'}`);
          console.log(`      Timezone: ${user.preferences.timezone || 'UTC'}`);
          console.log(`      Favorite Leagues: ${user.preferences.favoriteLeagues?.length || 0}`);
          console.log(`      Favorite Teams: ${user.preferences.favoriteTeams?.length || 0}`);
        }
        
        console.log(`   🎯 BETTING LIMITS:`);
        console.log(`      Daily Limit: ${formatCurrency(user.dailyBetLimit)}`);
        console.log(`      Weekly Limit: ${formatCurrency(user.weeklyBetLimit)}`);
        console.log(`      Monthly Limit: ${formatCurrency(user.monthlyBetLimit)}`);
      });
    }
    
    // Get all bets
    const bets = await Bet.find({}).populate('userId', 'firstName lastName email').lean();
    console.log(`\n\n🎲 TOTAL BETS: ${bets.length}`);
    console.log('=' * 60);
    
    if (bets.length === 0) {
      console.log('❌ No bets found in database');
    } else {
      // Show last 10 bets
      const recentBets = bets.slice(-10).reverse();
      console.log(`\n📈 LAST ${Math.min(10, bets.length)} BETS:`);
      console.log('-' * 60);
      
      recentBets.forEach((bet, index) => {
        console.log(`\n🎯 BET ${index + 1}:`);
        console.log(`   Bet ID: ${bet.betId}`);
        console.log(`   User: ${bet.userId?.firstName} ${bet.userId?.lastName} (${bet.userId?.email})`);
        console.log(`   Status: ${bet.status?.toUpperCase()}`);
        console.log(`   Type: ${bet.betType}`);
        console.log(`   Selection: ${bet.selection}`);
        console.log(`   Stake: ${formatCurrency(bet.amount)}`);
        console.log(`   Odds: ${bet.odds}`);
        console.log(`   Potential Winnings: ${formatCurrency(bet.potentialWinnings)}`);
        console.log(`   Placed At: ${formatDate(bet.placedAt)}`);
        console.log(`   Created: ${formatDate(bet.createdAt)}`);
        
        if (bet.fixture) {
          console.log(`   🏟️ FIXTURE:`);
          console.log(`      ID: ${bet.fixture.id}`);
          console.log(`      Date: ${formatDate(bet.fixture.date)}`);
          console.log(`      Home Team: ${bet.fixture.homeTeam?.name || 'N/A'}`);
          console.log(`      Away Team: ${bet.fixture.awayTeam?.name || 'N/A'}`);
          console.log(`      League: ${bet.fixture.league?.name || 'N/A'}`);
          console.log(`      Country: ${bet.fixture.league?.country || 'N/A'}`);
          console.log(`      Venue: ${bet.fixture.venue?.name || 'N/A'}`);
        }
        
        if (bet.result) {
          console.log(`   📊 RESULT:`);
          console.log(`      Actual Outcome: ${bet.result.actualOutcome || 'N/A'}`);
          console.log(`      Correct Prediction: ${bet.result.correctPrediction ? 'Yes' : 'No'}`);
          console.log(`      Final Score: ${bet.result.finalScore?.home || 'N/A'} - ${bet.result.finalScore?.away || 'N/A'}`);
          console.log(`      Match Status: ${bet.result.matchStatus || 'N/A'}`);
          console.log(`      Settled At: ${formatDate(bet.result.settledAt)}`);
          console.log(`      Settled By: ${bet.result.settledBy || 'N/A'}`);
        }
        
        if (bet.isLiveBet) {
          console.log(`   🔴 LIVE BET:`);
          console.log(`      Minute: ${bet.liveData?.minute || 'N/A'}`);
          console.log(`      Score When Placed: ${bet.liveData?.score?.home || 0} - ${bet.liveData?.score?.away || 0}`);
        }
        
        if (bet.analytics) {
          console.log(`   📈 ANALYTICS:`);
          console.log(`      Confidence: ${bet.analytics.confidence || 'N/A'}%`);
          console.log(`      Expected Value: ${bet.analytics.expectedValue || 'N/A'}`);
          console.log(`      Kelly Percentage: ${bet.analytics.kellyPercentage || 'N/A'}%`);
          console.log(`      Value Rating: ${bet.analytics.valueRating || 'N/A'}`);
        }
      });
    }
    
    // Betting statistics
    console.log(`\n\n📊 BETTING STATISTICS:`);
    console.log('=' * 60);
    
    const totalStaked = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    const totalWinnings = bets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + (bet.potentialWinnings || 0), 0);
    const totalLosses = bets.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + (bet.amount || 0), 0);
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const lostBets = bets.filter(bet => bet.status === 'lost').length;
    const pendingBets = bets.filter(bet => bet.status === 'pending').length;
    const cancelledBets = bets.filter(bet => bet.status === 'cancelled').length;
    
    console.log(`Total Bets Placed: ${bets.length}`);
    console.log(`Won Bets: ${wonBets}`);
    console.log(`Lost Bets: ${lostBets}`);
    console.log(`Pending Bets: ${pendingBets}`);
    console.log(`Cancelled Bets: ${cancelledBets}`);
    console.log(`Overall Win Rate: ${calculateWinRate(wonBets, wonBets + lostBets)}`);
    console.log(`Total Amount Staked: ${formatCurrency(totalStaked)}`);
    console.log(`Total Winnings: ${formatCurrency(totalWinnings)}`);
    console.log(`Total Losses: ${formatCurrency(totalLosses)}`);
    console.log(`Net Profit/Loss: ${formatCurrency(totalWinnings - totalLosses)}`);
    
    // Bet type distribution
    const betTypeStats = {};
    bets.forEach(bet => {
      if (bet.betType) {
        betTypeStats[bet.betType] = (betTypeStats[bet.betType] || 0) + 1;
      }
    });
    
    if (Object.keys(betTypeStats).length > 0) {
      console.log(`\n🎯 BET TYPE DISTRIBUTION:`);
      console.log('-' * 30);
      Object.entries(betTypeStats).forEach(([type, count]) => {
        console.log(`${type}: ${count} bets`);
      });
    }
    
    // Recent activity
    const recentActivity = bets.filter(bet => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return bet.createdAt && new Date(bet.createdAt) > oneWeekAgo;
    });
    
    console.log(`\n📅 RECENT ACTIVITY (Last 7 days):`);
    console.log('-' * 30);
    console.log(`New Bets: ${recentActivity.length}`);
    console.log(`Recent Stake: ${formatCurrency(recentActivity.reduce((sum, bet) => sum + (bet.amount || 0), 0))}`);
    
    // Database collections info
    console.log(`\n\n🗃️ DATABASE COLLECTIONS:`);
    console.log('=' * 60);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Total Collections: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`   • ${collection.name}`);
    });
    
    // User balance summary
    const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
    console.log(`\n\n💰 BALANCE SUMMARY:`);
    console.log('=' * 60);
    console.log(`Total User Balance: ${formatCurrency(totalBalance)}`);
    console.log(`Average Balance: ${formatCurrency(totalBalance / Math.max(users.length, 1))}`);
    
    const balanceDistribution = {
      'Under $100': users.filter(u => (u.balance || 0) < 100).length,
      '$100 - $500': users.filter(u => (u.balance || 0) >= 100 && (u.balance || 0) < 500).length,
      '$500 - $1000': users.filter(u => (u.balance || 0) >= 500 && (u.balance || 0) < 1000).length,
      'Over $1000': users.filter(u => (u.balance || 0) >= 1000).length
    };
    
    console.log(`\n💸 BALANCE DISTRIBUTION:`);
    console.log('-' * 30);
    Object.entries(balanceDistribution).forEach(([range, count]) => {
      console.log(`${range}: ${count} users`);
    });
    
    console.log(`\n\n✅ DATABASE INSPECTION COMPLETE!`);
    console.log('=' * 60);
    console.log(`📝 SUMMARY:`);
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Bets: ${bets.length}`);
    console.log(`   • Total Staked: ${formatCurrency(totalStaked)}`);
    console.log(`   • Total Balance: ${formatCurrency(totalBalance)}`);
    console.log(`   • Database: ${mongoose.connection.name}`);
    console.log(`   • Host: ${mongoose.connection.host}`);
    console.log(`   • Collections: ${collections.length}`);
    console.log(`\n🔐 All data is stored in MongoDB - No hardcoded values!`);
    console.log('=' * 60);
    
  } catch (error) {
    console.error('❌ Error during database inspection:', error);
  }
};

// Run the inspection
const run = async () => {
  await connectDB();
  await inspectDatabase();
  process.exit(0);
};

run().catch(console.error);