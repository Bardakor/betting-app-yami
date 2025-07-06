const mongoose = require('mongoose');

const recentFormSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  leagueId: {
    type: Number,
    required: true
  },
  leagueName: {
    type: String,
    required: true
  },
  season: {
    type: String,
    required: true
  },
  matches: [{
    fixtureId: String,
    date: Date,
    opponent: String,
    homeAway: String, // 'home' or 'away'
    result: String, // 'W', 'D', 'L'
    goalsFor: Number,
    goalsAgainst: Number,
    points: Number // 3 for win, 1 for draw, 0 for loss
  }],
  formString: {
    type: String, // e.g., "WWLDW"
    default: ''
  },
  last5Points: {
    type: Number,
    default: 0
  },
  last5GoalsFor: {
    type: Number,
    default: 0
  },
  last5GoalsAgainst: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for unique team/league/season combination
recentFormSchema.index({ teamId: 1, leagueId: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('RecentForm', recentFormSchema);
