const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  // Match information
  fixtureId: {
    type: Number,
    required: true
  },
  
  // Bet details
  betType: {
    type: String,
    required: true,
    enum: ['match_winner', 'over_under', 'both_teams_score', 'double_chance', 'exact_score']
  },
  
  selection: {
    type: String,
    required: true // 'home', 'draw', 'away', 'over', 'under', 'yes', 'no', etc.
  },
  
  stake: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  
  odds: {
    type: Number,
    required: true,
    min: 1.01
  },
  
  potentialWin: {
    type: Number,
    required: true
  },
  
  // Match context (for reference)
  matchInfo: {
    homeTeam: {
      id: Number,
      name: String
    },
    awayTeam: {
      id: Number,
      name: String
    },
    league: {
      id: Number,
      name: String,
      country: String
    },
    kickoffTime: Date
  },
  
  // Bet status and result
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'void', 'cancelled'],
    default: 'active'
  },
  
  result: {
    isSettled: {
      type: Boolean,
      default: false
    },
    settledAt: Date,
    finalScore: {
      home: Number,
      away: Number
    },
    winAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  placedAt: {
    type: Date,
    default: Date.now
  },
  
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for performance
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ fixtureId: 1 });
betSchema.index({ status: 1 });
betSchema.index({ placedAt: -1 });
betSchema.index({ 'result.isSettled': 1 });

// Virtual for profit/loss
betSchema.virtual('profitLoss').get(function() {
  if (this.status === 'won') {
    return this.result.winAmount - this.stake;
  } else if (this.status === 'lost') {
    return -this.stake;
  }
  return 0;
});

// Methods
betSchema.methods.calculatePotentialWin = function() {
  return this.stake * this.odds;
};

betSchema.methods.settle = function(matchResult) {
  this.result.isSettled = true;
  this.result.settledAt = new Date();
  this.result.finalScore = matchResult.score;
  
  // Determine if bet won or lost based on bet type and selection
  const isWon = this.checkBetResult(matchResult);
  
  if (isWon) {
    this.status = 'won';
    this.result.winAmount = this.potentialWin;
  } else {
    this.status = 'lost';
    this.result.winAmount = 0;
  }
  
  return this.save();
};

betSchema.methods.checkBetResult = function(matchResult) {
  const { score, status } = matchResult;
  
  // If match was cancelled or postponed
  if (status === 'CANC' || status === 'PST') {
    this.status = 'void';
    return false;
  }
  
  switch (this.betType) {
    case 'match_winner':
      if (score.home > score.away && this.selection === 'home') return true;
      if (score.home < score.away && this.selection === 'away') return true;
      if (score.home === score.away && this.selection === 'draw') return true;
      return false;
      
    case 'over_under':
      const totalGoals = score.home + score.away;
      const line = parseFloat(this.selection.replace('over_', '').replace('under_', ''));
      if (this.selection.startsWith('over_') && totalGoals > line) return true;
      if (this.selection.startsWith('under_') && totalGoals < line) return true;
      return false;
      
    case 'both_teams_score':
      const bothScored = score.home > 0 && score.away > 0;
      if (this.selection === 'yes' && bothScored) return true;
      if (this.selection === 'no' && !bothScored) return true;
      return false;
      
    default:
      return false;
  }
};

// Static methods
betSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalStaked: { $sum: '$stake' },
        wonBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
        lostBets: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
        totalWinnings: { $sum: '$result.winAmount' },
        activeBets: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalBets: 0,
      totalStaked: 0,
      wonBets: 0,
      lostBets: 0,
      totalWinnings: 0,
      activeBets: 0,
      winRate: 0,
      profitLoss: 0
    };
  }
  
  const result = stats[0];
  result.winRate = result.totalBets > 0 ? ((result.wonBets / result.totalBets) * 100).toFixed(2) : 0;
  result.profitLoss = result.totalWinnings - result.totalStaked;
  
  return result;
};

module.exports = mongoose.model('Bet', betSchema); 