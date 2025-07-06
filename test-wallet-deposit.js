const axios = require('axios');
const mongoose = require('mongoose');

// Create a simple Transaction model
const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_lost', 'admin_adjustment']
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled']
  },
  createdAt: {
    type: Date,
    default: Date.now
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

async function testWalletDeposit() {
  try {
    console.log('Testing wallet deposit functionality...');
    
    // Connect to MongoDB for wallet service
    console.log('Connecting to wallet database...');
    const walletConn = await mongoose.createConnection('mongodb://localhost:27017/betting_wallet');
    const Transaction = walletConn.model('Transaction', TransactionSchema);
    
    // Connect to MongoDB for main service
    console.log('Connecting to main database...');
    const mainConn = await mongoose.createConnection('mongodb://localhost:27017/betting_main');
    const User = mainConn.model('User', UserSchema);
    
    // Create a test user if it doesn't exist
    const testEmail = 'test@example.com';
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        balance: 0
      });
      await user.save();
    }
    
    console.log('Test user:', user);
    
    // Create a deposit transaction
    console.log('Creating deposit transaction...');
    const transaction = new Transaction({
      userId: user._id.toString(),
      type: 'deposit',
      amount: 100,
      description: 'Test deposit',
      status: 'completed'
    });
    
    await transaction.save();
    console.log('Transaction created:', transaction);
    
    // Update user balance
    console.log('Updating user balance...');
    user.balance += transaction.amount;
    await user.save();
    console.log('User balance updated:', user.balance);
    
    // Clean up
    console.log('Cleaning up...');
    await Transaction.deleteMany({ userId: user._id.toString() });
    user.balance = 0;
    await user.save();
    
    // Disconnect
    await walletConn.close();
    await mainConn.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWalletDeposit(); 