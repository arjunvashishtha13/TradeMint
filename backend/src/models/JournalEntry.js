const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction', // Optional link to a specific trade
  },
  symbol: {
    type: String,
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL', 'NOTE'],
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
  },
  performanceReview: {
    type: String,
  },
}, {
  timestamps: true,
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
module.exports = JournalEntry;
