const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// Simple memory database for demo
const users = [
  {
    id: 'admin123',
    email: 'admin@admin.com',
    password: 'admin123', // Plain text for demo simplicity
    firstName: 'Admin',
    lastName: 'User',
    balance: 100000,
    isActive: true,
    stats: {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      totalWinnings: 0,
      totalLosses: 0
    }
  }
];

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'elite-betting-super-secret-jwt-key-2024-production',
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'elite-betting-super-secret-jwt-key-2024-production');
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
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// Export users array for access from other files
router.users = users;

module.exports = router; 