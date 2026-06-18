const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'trademintsecret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create initial portfolio for user
      await Portfolio.create({ user: user._id });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Calculate real metrics from Transactions
      const Transaction = require('../models/Transaction');
      const transactions = await Transaction.find({ user: user._id });
      
      let tradesExecuted = transactions.length;
      let totalVolume = 0;
      let profitableTrades = 0;

      // Basic calculation for volume and profitable trades
      const assetAvgCost = {};
      
      transactions.forEach(tx => {
        totalVolume += (tx.price * tx.quantity);
        if (tx.type === 'BUY') {
          if (!assetAvgCost[tx.symbol]) {
            assetAvgCost[tx.symbol] = { totalCost: 0, totalQty: 0 };
          }
          assetAvgCost[tx.symbol].totalCost += (tx.price * tx.quantity);
          assetAvgCost[tx.symbol].totalQty += tx.quantity;
        } else if (tx.type === 'SELL') {
          const avgCost = assetAvgCost[tx.symbol] ? (assetAvgCost[tx.symbol].totalCost / assetAvgCost[tx.symbol].totalQty) : 0;
          if (tx.price > avgCost) {
            profitableTrades++;
          }
        }
      });

      // Generate dynamic badges
      const badges = [];
      if (tradesExecuted >= 1) badges.push('First Trade');
      if (tradesExecuted >= 10) badges.push('Active Trader');
      if (tradesExecuted >= 50) badges.push('Market Veteran');
      if (totalVolume >= 10000) badges.push('High Roller');
      if (profitableTrades >= 5) badges.push('Profit Maker');
      if (badges.length === 0) badges.push('Early Adopter');

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        activityMetrics: {
          tradesExecuted,
          totalVolume,
          profitableTrades
        },
        badges
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
