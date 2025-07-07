const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  fixtureId: {
    type: String,
    required: true
  },
  betType: {
    type: String,
    required: true,
    enum: ['home', 'away', 'draw']
  },
  amount: {
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
  potentialWinning: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  fixture: {
    homeTeam: String,
    awayTeam: String,
    league: String,
    date: Date
  },
  resultProcessedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ fixtureId: 1 });
betSchema.index({ status: 1 });
betSchema.index({ createdAt: -1 });

// Calculate potential winning before saving
betSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('odds')) {
    this.potentialWinning = this.amount * this.odds;
  }
  next();
});

module.exports = mongoose.model('Bet', betSchema);
