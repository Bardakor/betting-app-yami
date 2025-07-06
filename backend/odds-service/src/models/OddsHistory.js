const mongoose = require('mongoose');

const oddsHistorySchema = new mongoose.Schema({
  fixtureId: {
    type: String,
    required: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  leagueName: {
    type: String,
    required: true
  },
  leagueId: {
    type: Number,
    required: true
  },
  homeWinOdds: {
    type: Number,
    required: true
  },
  drawOdds: {
    type: Number,
    required: true
  },
  awayWinOdds: {
    type: Number,
    required: true
  },
  over25Odds: {
    type: Number
  },
  under25Odds: {
    type: Number
  },
  bttsYesOdds: {
    type: Number
  },
  bttsNoOdds: {
    type: Number
  },
  calculationMethod: {
    type: String,
    default: 'advanced'
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  calculationFactors: {
    recentForm: Number,
    headToHead: Number,
    teamStrength: Number,
    homeAdvantage: Number,
    injuriesForm: Number,
    marketTrends: Number
  }
}, {
  timestamps: true
});

// Create indexes
oddsHistorySchema.index({ fixtureId: 1 });
oddsHistorySchema.index({ homeTeam: 1, awayTeam: 1 });
oddsHistorySchema.index({ leagueId: 1 });
oddsHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('OddsHistory', oddsHistorySchema);
