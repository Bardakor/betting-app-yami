const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      displayName: user.displayName 
    },
    process.env.JWT_SECRET || 'fallback-secret-for-development',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'demo-client-id-replace-with-real') {
    return res.status(501).json({
      success: false,
      message: 'Google OAuth not configured. Please set up Google OAuth credentials in .env file.',
      setup_instructions: 'https://console.cloud.google.com/'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'demo-client-id-replace-with-real') {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err) {
      console.error('OAuth callback error:', err);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
    
    try {
      // Generate JWT token
      const token = generateToken(user);
      
      console.log('OAuth success, redirecting with token');
      
      // Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}?token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  })(req, res, next);
});

// Demo login endpoint (for testing without Google OAuth)
router.post('/demo-login', async (req, res) => {
  try {
    console.log('Demo login attempt');
    
    // Create or find demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    
    if (!demoUser) {
      demoUser = new User({
        googleId: 'demo-google-id',
        email: 'demo@example.com',
        displayName: 'Demo User',
        picture: 'https://via.placeholder.com/150',
        firstName: 'Demo',
        lastName: 'User',
        verified: true
      });
      
      demoUser = await demoUser.save();
      console.log('Created demo user');
    }
    
    // Generate JWT token
    const token = generateToken(demoUser);
    
    res.json({
      success: true,
      message: 'Demo login successful',
      token,
      user: {
        id: demoUser._id,
        email: demoUser.email,
        displayName: demoUser.displayName,
        picture: demoUser.picture
      }
    });
    
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo login failed',
      error: error.message
    });
  }
});

// Get user profile (JWT protected)
router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      res.json({
        success: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          displayName: req.user.displayName,
          picture: req.user.picture,
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch profile' 
      });
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  try {
    // In JWT, logout is handled client-side by removing the token
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// External API example (JWT protected)
router.get('/external-api',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log('External API call by user:', req.user.email);
      
      // Example external API call
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      
      res.json({
        success: true,
        message: 'External API call successful',
        data: response.data,
        user: req.user.email
      });
    } catch (error) {
      console.error('External API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'External API call failed',
        error: error.message 
      });
    }
  }
);

// Token validation endpoint
router.get('/validate-token',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName
      }
    });
  }
);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'main-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
