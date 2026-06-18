const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    default: 'My Watchlist',
  },
  sector: {
    type: String,
  },
  symbols: [{
    symbol: String,
    name: String,
    priceChange: Number,
    priceChangePercent: Number,
  }],
}, {
  timestamps: true,
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist;
