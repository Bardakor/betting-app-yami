const mongoose = require('mongoose');

const teamStatsSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true
  },
  teamName: {
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
  season: {
    type: String,
    required: true
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  homeWins: {
    type: Number,
    default: 0
  },
  homeDraws: {
    type: Number,
    default: 0
  },
  homeLosses: {
    type: Number,
    default: 0
  },
  awayWins: {
    type: Number,
    default: 0
  },
  awayDraws: {
    type: Number,
    default: 0
  },
  awayLosses: {
    type: Number,
    default: 0
  },
  recentForm: {
    type: String,
    default: ''
  },
  avgGoalsScored: {
    type: Number,
    default: 0
  },
  avgGoalsConceded: {
    type: Number,
    default: 0
  },
  xg: {
    type: Number,
    default: 0
  },
  xga: {
    type: Number,
    default: 0
  },
  avgPossession: {
    type: Number,
    default: 0
  },
  passAccuracy: {
    type: Number,
    default: 0
  },
  shotsPerGame: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for unique team/league/season combination
teamStatsSchema.index({ teamName: 1, leagueName: 1, season: 1 }, { unique: true });
teamStatsSchema.index({ teamId: 1, leagueId: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('TeamStats', teamStatsSchema);
