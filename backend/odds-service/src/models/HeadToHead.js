const mongoose = require('mongoose');

const headToHeadSchema = new mongoose.Schema({
  team1: {
    type: String,
    required: true
  },
  team2: {
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
  totalMatches: {
    type: Number,
    default: 0
  },
  team1Wins: {
    type: Number,
    default: 0
  },
  team2Wins: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  last5Results: {
    type: String,
    default: ''
  },
  avgGoalsTeam1: {
    type: Number,
    default: 0
  },
  avgGoalsTeam2: {
    type: Number,
    default: 0
  },
  results: [{
    date: Date,
    homeTeam: String,
    awayTeam: String,
    homeScore: Number,
    awayScore: Number,
    result: String // 'team1_win', 'team2_win', 'draw'
  }]
}, {
  timestamps: true
});

// Create compound index for unique team pair/league combination
headToHeadSchema.index({ team1: 1, team2: 1, leagueName: 1 }, { unique: true });

module.exports = mongoose.model('HeadToHead', headToHeadSchema);
