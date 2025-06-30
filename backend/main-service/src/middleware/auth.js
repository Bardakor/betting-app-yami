const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    // Add user info to request object
    req.userId = user._id.toString();
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.userId = user._id.toString();
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin role check middleware (use after auth middleware)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user has sufficient balance for betting
const checkBalance = (minAmount = 0) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.balance < minAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance.',
        currentBalance: req.user.balance,
        requiredAmount: minAmount
      });
    }

    next();
  };
};

// Rate limiting for betting actions
const bettingRateLimit = (maxBetsPerMinute = 10) => {
  const userBetCounts = new Map();

  return (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userId = req.userId;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago

    // Get or create user's bet history
    if (!userBetCounts.has(userId)) {
      userBetCounts.set(userId, []);
    }

    const userBets = userBetCounts.get(userId);
    
    // Remove old entries
    const recentBets = userBets.filter(timestamp => timestamp > windowStart);
    userBetCounts.set(userId, recentBets);

    // Check if user has exceeded the limit
    if (recentBets.length >= maxBetsPerMinute) {
      return res.status(429).json({
        success: false,
        message: `Too many betting requests. Maximum ${maxBetsPerMinute} bets per minute allowed.`,
        retryAfter: 60
      });
    }

    // Add current request
    recentBets.push(now);
    userBetCounts.set(userId, recentBets);

    next();
  };
};

// Validate bet limits middleware
const validateBetLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet amount.'
      });
    }

    // Check daily limit
    if (!req.user.canPlaceBet(amount, 'daily')) {
      return res.status(400).json({
        success: false,
        message: 'Bet amount exceeds daily limit.',
        dailyLimit: req.user.dailyBetLimit,
        currentBalance: req.user.balance
      });
    }

    next();
  } catch (error) {
    console.error('Bet validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bet validation.'
    });
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  checkBalance,
  bettingRateLimit,
  validateBetLimits
}; 