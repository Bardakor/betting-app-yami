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

// In-memory storage fallback
let inMemoryOddsHistory = [];

const OddsHistoryModel = {
  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('OddsHistory', oddsHistorySchema).find(query);
    }
    
    // In-memory fallback
    return inMemoryOddsHistory.filter(odds => {
      return Object.keys(query).every(key => 
        query[key] === undefined || odds[key] === query[key]
      );
    });
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('OddsHistory', oddsHistorySchema).findOne(query);
    }
    
    // In-memory fallback
    return inMemoryOddsHistory.find(odds => {
      return Object.keys(query).every(key => 
        query[key] === undefined || odds[key] === query[key]
      );
    });
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('OddsHistory', oddsHistorySchema).create(data);
    }
    
    // In-memory fallback
    const newOdds = {
      _id: new Date().getTime().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryOddsHistory.push(newOdds);
    return newOdds;
  },

  async findOneAndUpdate(query, update, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('OddsHistory', oddsHistorySchema).findOneAndUpdate(query, update, options);
    }
    
    // In-memory fallback
    const index = inMemoryOddsHistory.findIndex(odds => {
      return Object.keys(query).every(key => 
        query[key] === undefined || odds[key] === query[key]
      );
    });
    
    if (index !== -1) {
      inMemoryOddsHistory[index] = { ...inMemoryOddsHistory[index], ...update, updatedAt: new Date() };
      return inMemoryOddsHistory[index];
    } else if (options.upsert) {
      const newOdds = {
        _id: new Date().getTime().toString(),
        ...query,
        ...update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryOddsHistory.push(newOdds);
      return newOdds;
    }
    
    return null;
  },

  // Clear in-memory data (for testing)
  clearMemory() {
    inMemoryOddsHistory = [];
  }
};

module.exports = OddsHistoryModel;
