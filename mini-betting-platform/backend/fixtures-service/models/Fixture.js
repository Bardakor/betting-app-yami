const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema({
  externalId: {
    type: String,
    unique: true,
    sparse: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  league: {
    type: String,
    required: true
  },
  season: {
    type: String,
    default: '2024/25'
  },
  round: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'finished', 'postponed', 'cancelled'],
    default: 'upcoming'
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  odds: {
    home: {
      type: Number,
      default: 2.0
    },
    draw: {
      type: Number,
      default: 3.0
    },
    away: {
      type: Number,
      default: 2.5
    }
  },
  venue: {
    name: String,
    city: String,
    capacity: Number
  },
  referee: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    default: 'manual'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fixtureSchema.index({ date: 1 });
fixtureSchema.index({ status: 1 });
fixtureSchema.index({ league: 1 });
fixtureSchema.index({ homeTeam: 1, awayTeam: 1 });
fixtureSchema.index({ externalId: 1 });

// Update lastUpdated on save
fixtureSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Fixture', fixtureSchema);
