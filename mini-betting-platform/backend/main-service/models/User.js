const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  firstName: String,
  lastName: String,
  locale: String,
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
