const mongoose = require('mongoose');

// Create a simple Bet model
const BetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  fixtureId: {
    type: String,
    required: true,
    index: true
  },
  betType: {
    type: String,
    required: true,
    enum: ['match_winner', 'over_under', 'both_teams_score', 'double_chance', 'exact_score']
  },
  selection: {
    type: String,
    required: true
  },
  stake: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  odds: {
    type: Number,
    required: true,
    min: 1.01
  },
  potentialWin: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'void', 'cancelled'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Create a simple User model for the main service
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

async function testBetPlacement() {
  try {
    console.log('Testing bet placement functionality...');
    
    // Connect to MongoDB for bet service
    console.log('Connecting to bet database...');
    const betConn = await mongoose.createConnection('mongodb://localhost:27017/betting_bets');
    const Bet = betConn.model('Bet', BetSchema);
    
    // Connect to MongoDB for main service
    console.log('Connecting to main database...');
    const mainConn = await mongoose.createConnection('mongodb://localhost:27017/betting_main');
    const User = mainConn.model('User', UserSchema);
    
    // Find or create a test user
    const testEmail = 'test@example.com';
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        balance: 1000 // Give the user some balance
      });
      await user.save();
    } else {
      // Ensure user has enough balance
      user.balance = 1000;
      await user.save();
    }
    
    console.log('Test user:', user);
    
    // Create a bet
    console.log('Creating bet...');
    const bet = new Bet({
      userId: user._id.toString(),
      fixtureId: '12345',
      betType: 'match_winner',
      selection: 'home',
      stake: 50,
      odds: 2.5,
      potentialWin: 125, // 50 * 2.5
      status: 'active'
    });
    
    await bet.save();
    console.log('Bet created:', bet);
    
    // Deduct stake from user balance
    console.log('Updating user balance...');
    user.balance -= bet.stake;
    await user.save();
    console.log('User balance updated:', user.balance);
    
    // Clean up
    console.log('Cleaning up...');
    await Bet.deleteMany({ userId: user._id.toString() });
    user.balance = 0;
    await user.save();
    
    // Disconnect
    await betConn.close();
    await mainConn.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBetPlacement(); 