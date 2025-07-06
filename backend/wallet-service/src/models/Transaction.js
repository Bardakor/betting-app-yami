const mongoose = require('mongoose');
const { memoryDB } = require('../config/database');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'bet_stake', 'bet_win', 'bet_refund', 'admin_adjustment']
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Create mongoose model
const MongoTransaction = mongoose.model('Transaction', TransactionSchema);

// In-memory transaction operations
class InMemoryTransaction {
  constructor(data) {
    // Only set custom ID for in-memory storage, let MongoDB generate ObjectId
    if (mongoose.connection.readyState !== 1) {
      this._id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    this.userId = data.userId;
    this.type = data.type;
    this.amount = data.amount;
    this.balanceAfter = data.balanceAfter;
    this.description = data.description;
    this.metadata = data.metadata || {};
    this.status = data.status || 'completed';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected, use mongoose
      const mongoDoc = new MongoTransaction(this);
      const saved = await mongoDoc.save();
      Object.assign(this, saved.toObject());
      return this;
    } else {
      // Use in-memory storage
      memoryDB.transactions.push(this);
      return this;
    }
  }

  static async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongoTransaction.find(query);
    } else {
      // Filter in-memory transactions
      let results = memoryDB.transactions;
      
      if (query.userId) {
        results = results.filter(t => t.userId === query.userId);
      }
      if (query.type) {
        results = results.filter(t => t.type === query.type);
      }
      
      return results;
    }
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return await MongoTransaction.findById(id);
    } else {
      return memoryDB.transactions.find(t => t._id === id);
    }
  }

  static async countDocuments(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongoTransaction.countDocuments(query);
    } else {
      const results = await this.find(query);
      return results.length;
    }
  }
}

module.exports = InMemoryTransaction; 