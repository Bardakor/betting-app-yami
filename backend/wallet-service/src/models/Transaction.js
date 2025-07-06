const mongoose = require('mongoose');
const { memoryDB } = require('../config/database');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
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
    // Don't set _id for MongoDB - let it auto-generate
    this.transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    try {
      if (mongoose.connection.readyState === 1) {
        // MongoDB is connected, use mongoose
        // Don't pass _id, let MongoDB generate it
        const mongoData = {
          transactionId: this.transactionId,
          userId: this.userId,
          type: this.type,
          amount: this.amount,
          balanceAfter: this.balanceAfter,
          description: this.description,
          metadata: this.metadata,
          status: this.status
        };
        const mongoDoc = new MongoTransaction(mongoData);
        const saved = await mongoDoc.save();
        // Update local object with MongoDB _id
        this._id = saved._id;
        return this;
      } else {
        // Use in-memory storage
        this._id = this.transactionId;
        memoryDB.transactions.push(this);
        return this;
      }
    } catch (error) {
      console.log('MongoDB save failed, falling back to in-memory storage:', error.message);
      // Fallback to in-memory storage
      this._id = this.transactionId;
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