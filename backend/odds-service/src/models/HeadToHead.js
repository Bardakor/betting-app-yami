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

// In-memory storage fallback
let inMemoryHeadToHead = [];

const HeadToHeadModel = {
  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('HeadToHead', headToHeadSchema).find(query);
    }
    
    // In-memory fallback
    return inMemoryHeadToHead.filter(h2h => {
      return Object.keys(query).every(key => 
        query[key] === undefined || h2h[key] === query[key]
      );
    });
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('HeadToHead', headToHeadSchema).findOne(query);
    }
    
    // In-memory fallback
    return inMemoryHeadToHead.find(h2h => {
      return Object.keys(query).every(key => 
        query[key] === undefined || h2h[key] === query[key]
      );
    });
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('HeadToHead', headToHeadSchema).create(data);
    }
    
    // In-memory fallback
    const newH2H = {
      _id: new Date().getTime().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryHeadToHead.push(newH2H);
    return newH2H;
  },

  async findOneAndUpdate(query, update, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('HeadToHead', headToHeadSchema).findOneAndUpdate(query, update, options);
    }
    
    // In-memory fallback
    const index = inMemoryHeadToHead.findIndex(h2h => {
      return Object.keys(query).every(key => 
        query[key] === undefined || h2h[key] === query[key]
      );
    });
    
    if (index !== -1) {
      inMemoryHeadToHead[index] = { ...inMemoryHeadToHead[index], ...update, updatedAt: new Date() };
      return inMemoryHeadToHead[index];
    } else if (options.upsert) {
      const newH2H = {
        _id: new Date().getTime().toString(),
        ...query,
        ...update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryHeadToHead.push(newH2H);
      return newH2H;
    }
    
    return null;
  },

  // Clear in-memory data (for testing)
  clearMemory() {
    inMemoryHeadToHead = [];
  }
};

module.exports = HeadToHeadModel;
