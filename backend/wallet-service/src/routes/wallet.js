const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Middleware to verify JWT token with main service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token with main service
    const response = await axios.get(`${process.env.MAIN_SERVICE_URL}/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = response.data.user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get user balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    // Get balance from main service
    const response = await axios.get(`${process.env.MAIN_SERVICE_URL}/api/user/profile`, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch balance'
      });
    }

    res.json({
      success: true,
      balance: response.data.user.balance,
      currency: 'USD'
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching balance'
    });
  }
});

// Deposit money
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethod = 'credit_card' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be greater than 0.'
      });
    }

    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum deposit amount is $10,000'
      });
    }

    // Update balance in main service
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/api/user/update-balance`, {
      amount: amount,
      operation: 'add'
    }, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!updateResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update balance'
      });
    }

    // Record transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'deposit',
      amount: amount,
      balanceAfter: updateResponse.data.newBalance,
      description: `Deposit via ${paymentMethod}`,
      metadata: {
        paymentMethod,
        transactionId: `dep_${Date.now()}_${req.user.id.slice(-6)}`
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Deposit successful',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        newBalance: transaction.balanceAfter,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing deposit'
    });
  }
});

// Withdraw money
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethod = 'bank_transfer' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be greater than 0.'
      });
    }

    // Get current balance
    const balanceResponse = await axios.get(`${process.env.MAIN_SERVICE_URL}/api/user/profile`, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!balanceResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch current balance'
      });
    }

    const currentBalance = balanceResponse.data.user.balance;

    if (amount > currentBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is $10'
      });
    }

    // Update balance in main service
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/api/user/update-balance`, {
      amount: amount,
      operation: 'subtract'
    }, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!updateResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update balance'
      });
    }

    // Record transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'withdrawal',
      amount: amount,
      balanceAfter: updateResponse.data.newBalance,
      description: `Withdrawal via ${paymentMethod}`,
      metadata: {
        paymentMethod,
        transactionId: `wth_${Date.now()}_${req.user.id.slice(-6)}`
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal successful',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        newBalance: transaction.balanceAfter,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing withdrawal'
    });
  }
});

// Get transaction history
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id };
    if (type) {
      filter.type = type;
    }

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        description: t.description,
        status: t.status,
        timestamp: t.createdAt,
        metadata: t.metadata
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions'
    });
  }
});

// Admin: Add money to user account
router.post('/admin/add-funds', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId, amount, description = 'Admin funds addition' } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'User ID and valid amount are required'
      });
    }

    // Update balance in main service
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/api/admin/update-user-balance`, {
      userId,
      amount,
      operation: 'add'
    }, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!updateResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: updateResponse.data.message || 'Failed to update balance'
      });
    }

    // Record transaction
    const transaction = new Transaction({
      userId: userId,
      type: 'admin_adjustment',
      amount: amount,
      balanceAfter: updateResponse.data.newBalance,
      description,
      metadata: {
        adminId: req.user.id,
        transactionId: `admin_${Date.now()}_${userId.slice(-6)}`
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Funds added successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        newBalance: transaction.balanceAfter,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Admin add funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding funds'
    });
  }
});

// Process bet transaction (called by bet service)
router.post('/process-bet', async (req, res) => {
  try {
    const { userId, amount, type, betId, fixtureId, description } = req.body;

    if (!userId || !amount || !type || !betId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // For bet placement, check balance first
    if (type === 'bet_placed') {
      const balanceResponse = await axios.get(`${process.env.MAIN_SERVICE_URL}/api/user/${userId}/balance`);
      
      if (!balanceResponse.data.success || balanceResponse.data.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Deduct amount
      const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/api/admin/update-user-balance`, {
        userId,
        amount,
        operation: 'subtract'
      });

      if (!updateResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to deduct bet amount'
        });
      }

      // Record transaction
      const transaction = new Transaction({
        userId,
        type: 'bet_placed',
        amount,
        balanceAfter: updateResponse.data.newBalance,
        description: description || `Bet placed on fixture ${fixtureId}`,
        metadata: { betId, fixtureId }
      });

      await transaction.save();

      return res.json({
        success: true,
        message: 'Bet amount deducted',
        newBalance: updateResponse.data.newBalance
      });
    }

    // For bet wins/losses
    if (type === 'bet_won') {
      const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/api/admin/update-user-balance`, {
        userId,
        amount,
        operation: 'add'
      });

      const transaction = new Transaction({
        userId,
        type: 'bet_won',
        amount,
        balanceAfter: updateResponse.data.newBalance,
        description: description || `Bet won on fixture ${fixtureId}`,
        metadata: { betId, fixtureId }
      });

      await transaction.save();

      return res.json({
        success: true,
        message: 'Winnings added to balance',
        newBalance: updateResponse.data.newBalance
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid transaction type'
    });
  } catch (error) {
    console.error('Process bet transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing bet transaction'
    });
  }
});

module.exports = router; 