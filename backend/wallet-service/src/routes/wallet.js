const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Store admin token for service-to-service calls
let adminToken = null;

// Get admin token for service calls
const getAdminToken = async () => {
  if (!adminToken) {
    try {
      const response = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/login`, {
        email: 'admin@admin.com',
        password: 'admin123'
      });
      
      if (response.data.success) {
        adminToken = response.data.token;
        console.log('Admin token obtained for service calls');
        
        // Refresh token every 20 hours to avoid expiration
        setTimeout(() => {
          adminToken = null;
        }, 20 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to get admin token:', error.message);
    }
  }
  return adminToken;
};

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
    const mainServiceUrl = process.env.MAIN_SERVICE_URL || 'http://localhost:3001';
    console.log(`Verifying token with main service: ${mainServiceUrl}`);
    
    const response = await axios.get(`${mainServiceUrl}/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000 // 5 second timeout
    });

    if (!response.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user details from profile endpoint
    const profileResponse = await axios.get(`${mainServiceUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000 // 5 second timeout
    });

    if (profileResponse.data.success) {
      const user = profileResponse.data.user;
      req.user = {
        id: user.id || user._id,
        _id: user.id || user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        balance: user.balance,
        role: user.email === 'admin@admin.com' ? 'admin' : 'user'
      };
      console.log('User authenticated:', req.user.email, 'ID:', req.user.id);
    } else {
      req.user = { id: response.data.userId };
    }
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Root route - show available endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Wallet Service API',
    service: 'wallet-service',
    version: '1.0.0',
    availableEndpoints: [
      'GET /balance - Get user wallet balance (requires auth)',
      'POST /deposit - Deposit funds (requires auth)',
      'POST /withdraw - Withdraw funds (requires auth)',
      'GET /transactions - Get transaction history (requires auth)',
      'POST /internal/deduct - Internal bet deduction (service-to-service)',
      'POST /internal/credit - Internal bet credit (service-to-service)'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Wallet Service API is healthy',
    service: 'wallet-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get user balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    // Get balance from main service
    const response = await axios.get(`${process.env.MAIN_SERVICE_URL}/auth/profile`, {
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
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/update-balance`, {
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
    const balanceResponse = await axios.get(`${process.env.MAIN_SERVICE_URL}/auth/profile`, {
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
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/update-balance`, {
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
    if (req.user.role !== 'admin' && req.user.email !== 'admin@admin.com') {
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

    // Get admin token for service-to-service call
    const adminToken = await getAdminToken();
    if (!adminToken) {
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate service'
      });
    }

    // Update balance in main service
    const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/admin/update-user-balance`, {
      userId,
      amount,
      operation: 'add'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
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

    if (!userId || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // For bet placement, check balance first
    if (type === 'bet_placed') {
      try {
        // Get user balance from main service with 5-second timeout
        const balanceResponse = await axios.get(`${process.env.MAIN_SERVICE_URL}/auth/user/${userId}/balance`, { timeout: 5000 });
        console.log('Balance response:', balanceResponse.data);
        
        if (!balanceResponse.data.success || balanceResponse.data.balance < amount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance',
            currentBalance: balanceResponse.data.balance || 0,
            requiredAmount: amount
          });
        }
        
        // Get admin token for service-to-service call (fetch once and cache)
        const token = await getAdminToken();
        if (!token) {
          return res.status(500).json({ success: false, message: 'Service authentication failed' });
        }

        // Deduct amount from user balance (5-second timeout)
        const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/admin/update-user-balance`, {
          userId,
          amount,
          operation: 'subtract'
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (!updateResponse.data.success) {
          return res.status(400).json({
            success: false,
            message: updateResponse.data.message || 'Failed to deduct bet amount'
          });
        }

        // Record transaction
        const transaction = new Transaction({
          userId,
          type: 'bet_placed',
          amount,
          description: description || `Bet placed on fixture ${fixtureId}`,
          status: 'completed'
        });

        await transaction.save();

        return res.json({
          success: true,
          message: 'Bet amount deducted',
          newBalance: updateResponse.data.newBalance,
          transactionId: transaction._id
        });
      } catch (error) {
        console.error('Error processing bet:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to process bet transaction',
          error: error.message
        });
      }
    }

    // For bet wins/losses
    if (type === 'bet_won') {
      try {
        // Get admin token for service-to-service call
        const token = await getAdminToken();
        if (!token) {
          return res.status(500).json({
            success: false,
            message: 'Service authentication failed'
          });
        }

        // Add winnings to user balance
        const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/admin/update-user-balance`, {
          userId,
          amount,
          operation: 'add'
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (!updateResponse.data.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to add winnings'
          });
        }

        // Record transaction
        const transaction = new Transaction({
          userId,
          type: 'bet_won',
          amount,
          description: description || `Bet won on fixture ${fixtureId}`,
          status: 'completed'
        });

        await transaction.save();

        return res.json({
          success: true,
          message: 'Winnings added to balance',
          newBalance: updateResponse.data.newBalance
        });
      } catch (error) {
        console.error('Error processing bet win:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to process bet win transaction',
          error: error.message
        });
      }
    }

    // For bet refunds (cancelled bets)
    if (type === 'bet_refund') {
      try {
        // Get admin token for service-to-service call
        const token = await getAdminToken();
        if (!token) {
          return res.status(500).json({
            success: false,
            message: 'Service authentication failed'
          });
        }

        // Add refund to user balance
        const updateResponse = await axios.post(`${process.env.MAIN_SERVICE_URL}/auth/admin/update-user-balance`, {
          userId,
          amount,
          operation: 'add'
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (!updateResponse.data.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to process refund'
          });
        }

        // Record transaction
        const transaction = new Transaction({
          userId,
          type: 'bet_refund',
          amount,
          description: description || `Bet refunded for fixture ${fixtureId}`,
          status: 'completed'
        });

        await transaction.save();

        return res.json({
          success: true,
          message: 'Bet refunded successfully',
          newBalance: updateResponse.data.newBalance
        });
      } catch (error) {
        console.error('Error processing bet refund:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to process bet refund',
          error: error.message
        });
      }
    }

    return res.status(400).json({
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

// Update transaction with bet ID (called by bet service after bet is created)
router.put('/transaction/:transactionId/bet', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { betId } = req.body;

    if (!betId) {
      return res.status(400).json({
        success: false,
        message: 'Bet ID is required'
      });
    }

    // Update the transaction with the bet ID
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { 
        $set: { 
          'metadata.betId': betId 
        } 
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated with bet ID',
      transaction: {
        id: transaction._id,
        betId: transaction.metadata.betId
      }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transaction'
    });
  }
});

module.exports = router;