const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Betting-specific fields
  balance: {
    type: Number,
    default: 1000.00, // Starting balance
    min: 0
  },
  
  // User statistics
  stats: {
    totalBets: {
      type: Number,
      default: 0
    },
    wonBets: {
      type: Number,
      default: 0
    },
    lostBets: {
      type: Number,
      default: 0
    },
    pendingBets: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalLosses: {
      type: Number,
      default: 0
    },
    highestWin: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestWinStreak: {
      type: Number,
      default: 0
    }
  },
  
  // User preferences
  preferences: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    favoriteLeagues: [{
      type: Number // League IDs from API-Football
    }],
    favoriteTeams: [{
      type: Number // Team IDs from API-Football
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      betUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Risk management
  dailyBetLimit: {
    type: Number,
    default: 100.00
  },
  weeklyBetLimit: {
    type: Number,
    default: 500.00
  },
  monthlyBetLimit: {
    type: Number,
    default: 2000.00
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for win rate
userSchema.virtual('winRate').get(function() {
  if (this.stats.totalBets === 0) return 0;
  return ((this.stats.wonBets / this.stats.totalBets) * 100).toFixed(2);
});

// Virtual for profit/loss
userSchema.virtual('profitLoss').get(function() {
  return this.stats.totalWinnings - this.stats.totalLosses;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update betting statistics
userSchema.methods.updateBettingStats = function(betResult) {
  this.stats.totalBets += 1;
  
  if (betResult.status === 'won') {
    this.stats.wonBets += 1;
    this.stats.totalWinnings += betResult.winnings;
    this.stats.currentStreak = this.stats.currentStreak >= 0 ? this.stats.currentStreak + 1 : 1;
    
    if (betResult.winnings > this.stats.highestWin) {
      this.stats.highestWin = betResult.winnings;
    }
    
    if (this.stats.currentStreak > this.stats.longestWinStreak) {
      this.stats.longestWinStreak = this.stats.currentStreak;
    }
  } else if (betResult.status === 'lost') {
    this.stats.lostBets += 1;
    this.stats.totalLosses += betResult.amount;
    this.stats.currentStreak = this.stats.currentStreak <= 0 ? this.stats.currentStreak - 1 : -1;
  }
  
  // Update pending bets count
  this.stats.pendingBets = Math.max(0, this.stats.pendingBets + (betResult.status === 'pending' ? 1 : -1));
};

// Method to check betting limits
userSchema.methods.canPlaceBet = function(amount, period = 'daily') {
  const limits = {
    daily: this.dailyBetLimit,
    weekly: this.weeklyBetLimit,
    monthly: this.monthlyBetLimit
  };
  
  return amount <= limits[period] && amount <= this.balance;
};

// Method to place bet (update balance)
userSchema.methods.placeBet = function(amount) {
  if (this.balance >= amount) {
    this.balance -= amount;
    return true;
  }
  return false;
};

// Method to process bet result
userSchema.methods.processBetResult = function(bet) {
  if (bet.status === 'won') {
    this.balance += bet.potentialWinnings;
  }
  // For lost bets, money is already deducted when bet was placed
  
  this.updateBettingStats(bet);
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 