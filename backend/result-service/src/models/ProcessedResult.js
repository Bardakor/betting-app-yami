const mongoose = require('mongoose');

const processedResultSchema = new mongoose.Schema({
  fixtureId: {
    type: Number,
    required: true,
    unique: true
  },
  
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
    }
  },
  
  finalScore: {
    home: {
      type: Number,
      required: true
    },
    away: {
      type: Number,
      required: true
    }
  },
  
  matchStatus: {
    type: String,
    required: true
  },
  
  processedAt: {
    type: Date,
    default: Date.now
  },
  
  betsSettled: {
    type: Number,
    default: 0
  },
  
  totalWinnings: {
    type: Number,
    default: 0
  },
  
  metadata: {
    kickoffTime: Date,
    endTime: Date,
    duration: Number
  }
}, {
  timestamps: true
});

// Indexes
processedResultSchema.index({ fixtureId: 1 });
processedResultSchema.index({ processedAt: -1 });

module.exports = mongoose.model('ProcessedResult', processedResultSchema); 