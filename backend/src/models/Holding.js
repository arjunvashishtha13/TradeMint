const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  symbol: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  averagePrice: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

const Holding = mongoose.model('Holding', holdingSchema);
module.exports = Holding;
