const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists by email
    existingUser = await User.findOne({ email: profile.emails[0].value });
    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = profile.id;
      existingUser.avatar = profile.photos[0].value;
      existingUser.provider = 'google';
      await existingUser.save();
      return done(null, existingUser);
    }
    
    // Parse name from Google profile
    const displayName = profile.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || profile.name?.givenName || 'User';
    const lastName = nameParts.slice(1).join(' ') || profile.name?.familyName || '';
    
    // Create new user with proper schema
    const newUser = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: firstName,
      lastName: lastName,
      avatar: profile.photos[0].value,
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
    
    const savedUser = await newUser.save();
    done(null, savedUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 