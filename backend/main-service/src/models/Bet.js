const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Bet identification
  betId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Match information from API-Football
  fixture: {
    id: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    homeTeam: {
      id: Number,
      name: String,
      logo: String
    },
    awayTeam: {
      id: Number,
      name: String,
      logo: String
    },
    league: {
      id: Number,
      name: String,
      logo: String,
      country: String
    },
    venue: {
      name: String,
      city: String
    }
  },
  
  // Bet details
  betType: {
    type: String,
    required: true,
    enum: [
      'match_winner',      // 1X2
      'both_teams_score',  // BTTS
      'over_under',        // Total Goals
      'double_chance',     // 1X, 12, X2
      'correct_score',     // Exact score
      'first_goal_scorer', // Player to score first
      'handicap',          // Asian Handicap
      'clean_sheet',       // Team to keep clean sheet
      'corners',           // Corner bets
      'cards'              // Card bets
    ]
  },
  
  // Specific bet selection
  selection: {
    type: String,
    required: true
    // Examples: 'home', 'away', 'draw', 'over_2.5', 'under_2.5', 'yes', 'no', etc.
  },
  
  // Bet parameters (for specific bet types)
  parameters: {
    value: Number,        // For over/under, handicap values
    player: {             // For player-specific bets
      id: Number,
      name: String
    },
    score: {              // For correct score bets
      home: Number,
      away: Number
    }
  },
  
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  
  odds: {
    type: Number,
    required: true,
    min: 1.01
  },
  
  potentialWinnings: {
    type: Number,
    required: true
  },
  
  // Bet status
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled', 'cashout'],
    default: 'pending',
    index: true
  },
  
  // Result tracking
  result: {
    actualOutcome: String,      // What actually happened
    correctPrediction: Boolean, // Whether the bet was correct
    finalScore: {
      home: Number,
      away: Number
    },
    matchStatus: String,        // finished, cancelled, postponed
    settledAt: Date,           // When the bet was settled
    settledBy: String          // system, admin
  },
  
  // Odds information
  oddsInfo: {
    bookmaker: String,
    market: String,
    openingOdds: Number,
    closingOdds: Number,
    maxOdds: Number,
    minOdds: Number,
    oddsMovement: String       // up, down, stable
  },
  
  // Bet placement info
  placedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  ipAddress: String,
  userAgent: String,
  
  // Live betting specific
  isLiveBet: {
    type: Boolean,
    default: false
  },
  
  liveData: {
    minute: Number,           // Match minute when bet was placed
    score: {                  // Score when bet was placed
      home: Number,
      away: Number
    },
    events: [String]          // Events that occurred before bet
  },
  
  // Cash out functionality
  cashout: {
    available: {
      type: Boolean,
      default: false
    },
    value: Number,           // Current cash out value
    multiplier: Number       // Cash out multiplier
  },
  
  // Notes and metadata
  notes: String,
  tags: [String],
  
  // Risk management
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Analytics data
  analytics: {
    confidence: Number,      // AI confidence in the bet (0-100)
    expectedValue: Number,   // Expected value calculation
    kellyPercentage: Number, // Kelly criterion percentage
    valueRating: String     // good_value, fair_value, poor_value
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
betSchema.index({ userId: 1, placedAt: -1 });
betSchema.index({ 'fixture.id': 1 });
betSchema.index({ status: 1, placedAt: -1 });
betSchema.index({ betType: 1 });
betSchema.index({ 'fixture.date': 1 });

// Virtual for profit/loss
betSchema.virtual('profitLoss').get(function() {
  if (this.status === 'won') {
    return this.potentialWinnings - this.amount;
  } else if (this.status === 'lost') {
    return -this.amount;
  }
  return 0;
});

// Virtual for return on investment
betSchema.virtual('roi').get(function() {
  if (this.status === 'won') {
    return ((this.potentialWinnings - this.amount) / this.amount * 100).toFixed(2);
  } else if (this.status === 'lost') {
    return -100;
  }
  return 0;
});

// Virtual for days until match
betSchema.virtual('daysUntilMatch').get(function() {
  if (!this.fixture.date) return null;
  const now = new Date();
  const matchDate = new Date(this.fixture.date);
  const diffTime = matchDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to calculate potential winnings
betSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('odds')) {
    this.potentialWinnings = parseFloat((this.amount * this.odds).toFixed(2));
  }
  next();
});

// Static method to get user's bet statistics
betSchema.statics.getUserStats = async function(userId, dateRange = {}) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId), ...dateRange } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalStaked: { $sum: '$amount' },
        totalWon: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'won'] }, '$potentialWinnings', 0] 
          }
        },
        totalLost: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'lost'] }, '$amount', 0] 
          }
        },
        wonBets: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'won'] }, 1, 0] 
          }
        },
        lostBets: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] 
          }
        },
        pendingBets: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] 
          }
        },
        averageOdds: { $avg: '$odds' },
        averageStake: { $avg: '$amount' },
        highestWin: { 
          $max: { 
            $cond: [{ $eq: ['$status', 'won'] }, '$potentialWinnings', 0] 
          }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Static method to get bet type distribution
betSchema.statics.getBetTypeDistribution = async function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$betType',
        count: { $sum: 1 },
        totalStaked: { $sum: '$amount' },
        wonCount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'won'] }, 1, 0] 
          }
        }
      }
    },
    {
      $addFields: {
        winRate: { 
          $multiply: [
            { $divide: ['$wonCount', '$count'] }, 
            100
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Method to check if bet can be settled
betSchema.methods.canSettle = function() {
  const now = new Date();
  const matchDate = new Date(this.fixture.date);
  
  // Can settle if match has passed and bet is still pending
  return this.status === 'pending' && now > matchDate;
};

// Method to settle bet
betSchema.methods.settle = function(actualResult) {
  if (!this.canSettle()) {
    throw new Error('Bet cannot be settled at this time');
  }
  
  // Determine if bet won based on actual result and bet type
  const isWin = this.evaluateBetResult(actualResult);
  
  this.status = isWin ? 'won' : 'lost';
  this.result = {
    actualOutcome: actualResult.outcome,
    correctPrediction: isWin,
    finalScore: actualResult.score,
    matchStatus: actualResult.matchStatus,
    settledAt: new Date(),
    settledBy: 'system'
  };
  
  return this.save();
};

// Method to evaluate bet result based on bet type
betSchema.methods.evaluateBetResult = function(actualResult) {
  const { betType, selection, parameters } = this;
  const { score, outcome } = actualResult;
  
  switch (betType) {
    case 'match_winner':
      return selection === outcome;
      
    case 'over_under':
      const totalGoals = score.home + score.away;
      if (selection.startsWith('over_')) {
        const threshold = parseFloat(selection.split('_')[1]);
        return totalGoals > threshold;
      } else if (selection.startsWith('under_')) {
        const threshold = parseFloat(selection.split('_')[1]);
        return totalGoals < threshold;
      }
      break;
      
    case 'both_teams_score':
      const btts = score.home > 0 && score.away > 0;
      return (selection === 'yes' && btts) || (selection === 'no' && !btts);
      
    case 'correct_score':
      return parameters.score.home === score.home && 
             parameters.score.away === score.away;
      
    // Add more bet type evaluations as needed
    default:
      return false;
  }
};

module.exports = mongoose.model('Bet', betSchema); 