const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { users } = require('../config/shared-users');
const router = express.Router();

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-fallback-secret',
    { expiresIn: '24h' }
  );
};

// Format user response
const formatUserResponse = (user, token = null) => {
  const response = {
    success: true,
    message: token ? 'Login successful' : 'User data retrieved',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      balance: user.balance,
      stats: user.stats,
      isActive: user.isActive
    }
  };

  if (token) {
    response.token = token;
  }

  return response;
};

// @route   POST /auth/login
// @desc    Simple login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Simple password check for demo
    if (password !== user.password) {
      console.log('❌ Password mismatch:', password, '!==', user.password);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);
    
    console.log('✅ Login successful for:', email);
    
    res.json(formatUserResponse(user, token));
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /auth/register
// @desc    Simple registration
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password: password, // Plain text for demo
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      balance: 1000,
      isActive: true,
      stats: {
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        totalWinnings: 0,
        totalLosses: 0
      }
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);
    
    console.log('✅ User registered:', email);
    
    res.status(201).json(formatUserResponse(newUser, token));
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.get('/verify-token', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    res.status(200).json({
      success: true,
      userId: decoded.userId,
      exp: decoded.exp
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @route   POST /auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.post('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code required'
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!googleClientId || !googleClientSecret || 
        googleClientId === 'your-actual-google-client-id' ||
        googleClientSecret === 'your-actual-google-client-secret') {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: googleClientId,
      client_secret: googleClientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.FRONTEND_URL}/auth/callback`
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const googleUser = userResponse.data;
    
    // Check if user exists
    let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
    
    if (!user) {
      // Create new user from Google data
      user = {
        id: `google_${googleUser.id}_${Date.now()}`,
        email: googleUser.email.toLowerCase(),
        firstName: googleUser.given_name || 'Google',
        lastName: googleUser.family_name || 'User',
        googleId: googleUser.id,
        avatar: googleUser.picture,
        balance: 1000,
        isActive: true,
        stats: {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          totalWinnings: 0,
          totalLosses: 0
        }
      };
      
      users.push(user);
      console.log('✅ New Google user created:', user.email);
    } else {
      console.log('✅ Existing Google user logged in:', user.email);
    }

    // Generate JWT token
    const token = generateToken(user.id);
    
    res.json(formatUserResponse(user, token));
  } catch (error) {
    console.error('❌ Google OAuth error:', error.response?.data || error.message);
    
    // Handle specific OAuth errors
    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(400).json({
        success: false,
        message: 'OAuth authorization code has expired or been used. Please try logging in again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// @route   GET /auth/profile  
// @desc    Get user profile
// @access  Private
router.get('/profile', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      console.log('❌ User not found for token, userId:', decoded.userId);
      console.log('📋 Available users:', users.map(u => ({ id: u.id, email: u.email })));
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile retrieved for user:', user.email);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        balance: user.balance,
        stats: user.stats,
        isActive: user.isActive,
        avatar: user.avatar,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Admin: Update user balance (for service-to-service calls)
router.post('/admin/update-user-balance', authenticate, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId, amount, operation } = req.body;

    if (!userId || !amount || !operation) {
      return res.status(400).json({
        success: false,
        message: 'userId, amount, and operation are required'
      });
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be "add" or "subtract"'
      });
    }

    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update balance
    const oldBalance = user.balance;
    if (operation === 'add') {
      user.balance += amount;
    } else {
      if (user.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance',
          currentBalance: user.balance,
          requiredAmount: amount
        });
      }
      user.balance -= amount;
    }

    // Update stats if available
    if (operation === 'subtract' && user.stats) {
      user.stats.totalStaked = (user.stats.totalStaked || 0) + amount;
    }

    console.log(`Balance updated for user ${user.email}: ${oldBalance} -> ${user.balance}`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      oldBalance,
      newBalance: user.balance,
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating balance'
    });
  }
});

// Get user balance by ID (for service-to-service calls)
router.get('/user/:userId/balance', (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      userId: user.id,
      balance: user.balance
    });
  } catch (error) {
    console.error('Get user balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching balance'
    });
  }
});

// Update balance endpoint (for authenticated users)
router.post('/update-balance', authenticate, (req, res) => {
  try {
    const { amount, operation } = req.body;

    if (!amount || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Amount and operation are required'
      });
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be "add" or "subtract"'
      });
    }

    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldBalance = user.balance;
    if (operation === 'add') {
      user.balance += amount;
    } else {
      if (user.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }
      user.balance -= amount;
    }

    console.log(`Balance updated for user ${user.email}: ${oldBalance} -> ${user.balance}`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      oldBalance,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating balance'
    });
  }
});

// Export users array for access from other files
router.users = users;

// Deposit endpoint (simplified for immediate functionality)
router.post('/deposit', authenticate, (req, res) => {
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

    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldBalance = user.balance;
    user.balance += amount;

    console.log(`Deposit successful for user ${user.email}: ${oldBalance} -> ${user.balance}`);

    res.json({
      success: true,
      message: 'Deposit successful',
      transaction: {
        amount: amount,
        newBalance: user.balance,
        timestamp: new Date().toISOString()
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

// Bet placement endpoint (simplified for immediate functionality)
router.post('/place-bet', authenticate, (req, res) => {
  try {
    const { fixtureId, betType, selection, stake, odds } = req.body;

    // Validation
    if (!fixtureId || !betType || !selection || !stake || !odds) {
      return res.status(400).json({
        success: false,
        message: 'All bet parameters are required'
      });
    }

    if (stake <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Stake must be greater than 0'
      });
    }

    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.balance < stake) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Deduct stake from balance
    const oldBalance = user.balance;
    user.balance -= stake;

    // Update user stats
    if (!user.stats) {
      user.stats = {
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        totalWinnings: 0,
        totalLosses: 0
      };
    }

    user.stats.totalBets += 1;
    user.stats.pendingBets += 1;

    const betId = `bet_${Date.now()}_${user.id.slice(-6)}`;
    const potentialWin = stake * odds;

    console.log(`Bet placed for user ${user.email}: ${oldBalance} -> ${user.balance}, Bet ID: ${betId}`);

    res.json({
      success: true,
      message: 'Bet placed successfully',
      bet: {
        id: betId,
        fixtureId,
        betType,
        selection,
        stake,
        odds,
        potentialWin,
        status: 'active',
        placedAt: new Date().toISOString()
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Bet placement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error placing bet'
    });
  }
});

module.exports = router; 