const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_lost', 'bet_refund', 'admin_adjustment']
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled']
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a virtual for id that returns _id as a string
transactionSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
transactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema); 