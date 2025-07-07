const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'demo-client-id-replace-with-real') {
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', profile.id, profile.displayName);
      
      // Check if user already exists
      let existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        console.log('Existing user found:', existingUser.email);
        return done(null, existingUser);
      }
      
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        picture: profile.photos[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        locale: profile._json.locale,
        verified: profile._json.email_verified
      });
      
      const savedUser = await newUser.save();
      console.log('New user created:', savedUser.email);
      
      return done(null, savedUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret-for-development'
}, async (jwtPayload, done) => {
  try {
    console.log('JWT Payload:', jwtPayload.userId);
    
    const user = await User.findById(jwtPayload.userId);
    
    if (user) {
      return done(null, user);
    } else {
      console.log('User not found for JWT:', jwtPayload.userId);
      return done(null, false);
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
