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

// In-memory storage fallback
let inMemoryRecentForm = [];

const RecentFormModel = {
  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('RecentForm', recentFormSchema).find(query);
    }
    
    // In-memory fallback
    return inMemoryRecentForm.filter(form => {
      return Object.keys(query).every(key => 
        query[key] === undefined || form[key] === query[key]
      );
    });
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('RecentForm', recentFormSchema).findOne(query);
    }
    
    // In-memory fallback
    return inMemoryRecentForm.find(form => {
      return Object.keys(query).every(key => 
        query[key] === undefined || form[key] === query[key]
      );
    });
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('RecentForm', recentFormSchema).create(data);
    }
    
    // In-memory fallback
    const newForm = {
      _id: new Date().getTime().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryRecentForm.push(newForm);
    return newForm;
  },

  async findOneAndUpdate(query, update, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.model('RecentForm', recentFormSchema).findOneAndUpdate(query, update, options);
    }
    
    // In-memory fallback
    const index = inMemoryRecentForm.findIndex(form => {
      return Object.keys(query).every(key => 
        query[key] === undefined || form[key] === query[key]
      );
    });
    
    if (index !== -1) {
      inMemoryRecentForm[index] = { ...inMemoryRecentForm[index], ...update, updatedAt: new Date() };
      return inMemoryRecentForm[index];
    } else if (options.upsert) {
      const newForm = {
        _id: new Date().getTime().toString(),
        ...query,
        ...update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryRecentForm.push(newForm);
      return newForm;
    }
    
    return null;
  },

  // Clear in-memory data (for testing)
  clearMemory() {
    inMemoryRecentForm = [];
  }
};

module.exports = RecentFormModel;
