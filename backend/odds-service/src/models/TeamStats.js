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

// In-memory storage fallback
let inMemoryTeamStats = [];

const TeamStatsModel = {
  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('TeamStats', teamStatsSchema).find(query);
    }
    
    // In-memory fallback
    return inMemoryTeamStats.filter(stat => {
      return Object.keys(query).every(key => 
        query[key] === undefined || stat[key] === query[key]
      );
    });
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('TeamStats', teamStatsSchema).findOne(query);
    }
    
    // In-memory fallback
    return inMemoryTeamStats.find(stat => {
      return Object.keys(query).every(key => 
        query[key] === undefined || stat[key] === query[key]
      );
    });
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('TeamStats', teamStatsSchema).create(data);
    }
    
    // In-memory fallback
    const newStat = {
      _id: new Date().getTime().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryTeamStats.push(newStat);
    return newStat;
  },

  async findOneAndUpdate(query, update, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('TeamStats', teamStatsSchema).findOneAndUpdate(query, update, options);
    }
    
    // In-memory fallback
    const index = inMemoryTeamStats.findIndex(stat => {
      return Object.keys(query).every(key => 
        query[key] === undefined || stat[key] === query[key]
      );
    });
    
    if (index !== -1) {
      if (options.upsert) {
        inMemoryTeamStats[index] = { ...inMemoryTeamStats[index], ...update, updatedAt: new Date() };
        return inMemoryTeamStats[index];
      } else {
        inMemoryTeamStats[index] = { ...inMemoryTeamStats[index], ...update, updatedAt: new Date() };
        return inMemoryTeamStats[index];
      }
    } else if (options.upsert) {
      const newStat = {
        _id: new Date().getTime().toString(),
        ...query,
        ...update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryTeamStats.push(newStat);
      return newStat;
    }
    
    return null;
  },

  // Clear in-memory data (for testing)
  clearMemory() {
    inMemoryTeamStats = [];
  }
};

module.exports = TeamStatsModel;
