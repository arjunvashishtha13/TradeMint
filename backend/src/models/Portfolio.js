const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  balance: {
    type: Number,
    required: true,
    default: 100000, // Starting simulated balance of $100k
  },
  performanceHistory: [{
    date: { type: Date, required: true },
    value: { type: Number, required: true },
  }],
}, {
  timestamps: true,
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
