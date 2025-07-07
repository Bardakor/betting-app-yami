const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const passport = require('passport');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-fallback-secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Send user response (without password)
const sendUserResponse = (res, user, token = null) => {
  const userObj = {
    id: user._id || user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    balance: user.balance || 0,
    stats: user.stats || {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      totalWinnings: 0,
      totalLosses: 0
    },
    isActive: user.isActive !== false
  };

  const response = {
    success: true,
    message: 'Operation successful',
    user: userObj
  };

  if (token) {
    response.token = token;
  }

  res.status(200).json(response);
};

// Helper function to find user in memory or MongoDB
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Helper function to compare password
const comparePassword = async (inputPassword, userPassword) => {
  try {
    return await bcrypt.compare(inputPassword, userPassword);
  } catch (error) {
    // Simple comparison for demo (not secure)
    return inputPassword === 'admin123' && userPassword.includes('admin123');
  }
};

// Helper to find user by either _id or googleId
const findUserByIdOrGoogleId = async (id) => {
  let user = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id);
    if (user) return user;
  }
  // Fallback to googleId
  user = await User.findOne({ googleId: id });
  return user;
};

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2-50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      balance: 0,
      stats: {
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        totalWinnings: 0,
        totalLosses: 0
      },
      isActive: true,
      createdAt: new Date()
    };

    let user;
    // Create user in MongoDB
    user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user._id || user.id);

    console.log(`✅ User registered: ${email}`);
    sendUserResponse(res, user, token);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    let user = await findUserByEmail(email);
    console.log('Login attempt for:', email);
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user._id || user.id);
      console.log('User active:', user.isActive);
    }
    
    // If user does not exist, automatically create an account (email/password quick-signup)
    if (!user) {
      console.log('No user found, automatically registering new user with email:', email);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUserData = {
        email,
        password: hashedPassword,
        firstName: email.split('@')[0],
        lastName: '',
        balance: 0,
        emailVerified: false,
        isActive: true,
        createdAt: new Date()
      };

      user = await User.create(newUserData);
      console.log('✅ Auto-registered new user:', email);
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check password
    console.log('Comparing password for user:', email);
    console.log('Input password:', password);
    console.log('Stored password hash:', user.password);
    
    const isMatch = await comparePassword(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login (only for MongoDB)
    if (user.save) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Update memory database
      user.lastLogin = new Date();
    }

    // Generate JWT token
    const token = generateToken(user._id || user.id);

    // Log the login
    console.log(`✅ User logged in: ${email}`);

    sendUserResponse(res, user, token);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    sendUserResponse(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('preferences.currency').optional().isIn(['USD', 'EUR', 'GBP']),
  body('preferences.timezone').optional().isString(),
  body('preferences.favoriteLeagues').optional().isArray(),
  body('preferences.favoriteTeams').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'preferences'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'preferences') {
          updates.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    );

    sendUserResponse(res, updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   POST /auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for this account'
      });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// Google OAuth routes
// @route   GET /auth/google
// @desc    Start Google OAuth flow
// @access  Public
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Update last login
      req.user.lastLogin = new Date();
      req.user.save();

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

// @route   POST /auth/google/callback
// @desc    Handle Google OAuth code exchange
// @access  Public
router.post('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    console.log('📝 POST /auth/google/callback - Processing OAuth code exchange');
    
    // Exchange authorization code for tokens
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/callback'
    );

    try {
      const { tokens } = await client.getToken(code);
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name, family_name, picture } = payload;

      // Find or create user
      let user = await User.findOne({ googleId });
      
      if (!user) {
        // Check if user exists by email
        user = await User.findOne({ email });
        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.avatar = picture;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId,
            email,
            firstName: given_name || email.split('@')[0],
            lastName: family_name || '',
            avatar: picture,
            provider: 'google',
            balance: 0,
            stats: {
              totalBets: 0,
              wonBets: 0,
              lostBets: 0,
              pendingBets: 0,
              totalWinnings: 0,
              totalLosses: 0
            },
            isActive: true,
            emailVerified: true,
            createdAt: new Date()
          });
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      console.log(`✅ Google OAuth successful for user: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          balance: user.balance || 0,
          avatar: user.avatar,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Google token exchange error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange authorization code'
      });
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// @route   POST /auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const newToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({
      success: true,
      message: 'Auth service is healthy',
      userCount: userCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error'
    });
  }
});

// @route   POST /auth/update-balance
// @desc    Update user balance (for authenticated users)
// @access  Private
router.post('/update-balance', auth, async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentBalance = user.balance || 0;
    let newBalance;

    if (operation === 'add') {
      newBalance = currentBalance + parseFloat(amount);
    } else if (operation === 'subtract') {
      newBalance = currentBalance - parseFloat(amount);
      if (newBalance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }

    user.balance = newBalance;
    await user.save();

    res.json({
      success: true,
      message: 'Balance updated successfully',
      userId: user._id,
      oldBalance: currentBalance,
      newBalance: newBalance,
      operation: operation,
      amount: parseFloat(amount)
    });
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /auth/user/:userId/balance
// @desc    Get user balance by ID (for service-to-service calls)
// @access  Public (service-to-service)
router.get('/user/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await findUserByIdOrGoogleId(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, balance: user.balance || 0, userId: user._id });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   POST /auth/admin/update-user-balance
// @desc    Update user balance (for service-to-service calls with admin token)
// @access  Private (admin only)
router.post('/admin/update-user-balance', auth, async (req, res) => {
  try {
    const { userId, amount, operation } = req.body;
    
    // Verify admin role
    if (req.user.role !== 'admin' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const user = await findUserByIdOrGoogleId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentBalance = user.balance || 0;
    let newBalance;

    if (operation === 'add') {
      newBalance = currentBalance + parseFloat(amount);
    } else if (operation === 'subtract') {
      newBalance = currentBalance - parseFloat(amount);
      if (newBalance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }

    user.balance = newBalance;
    await user.save();

    res.json({
      success: true,
      message: 'Balance updated successfully',
      userId: user._id,
      oldBalance: currentBalance,
      newBalance: newBalance,
      operation: operation,
      amount: parseFloat(amount)
    });
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /auth/admin/user/:userId
// @desc    Get user details by ID (for service-to-service calls)
// @access  Private (admin only)
router.get('/admin/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify admin role
    if (req.user.role !== 'admin' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const user = await findUserByIdOrGoogleId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance || 0,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /auth/profile
// @desc    Get current user profile (alias for /auth/me)
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        balance: user.balance || 0,
        stats: user.stats || {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          totalWinnings: 0,
          totalLosses: 0
        },
        isActive: user.isActive !== false,
        emailVerified: user.emailVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

module.exports = router;