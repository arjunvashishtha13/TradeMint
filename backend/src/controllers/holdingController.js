const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @desc    Get user holdings
// @route   GET /api/v1/holdings
const getHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id, quantity: { $gt: 0 } });
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buy stock
// @route   POST /api/v1/holdings/buy
const buyStock = async (req, res) => {
  const { symbol, name, quantity, price } = req.body;
  const totalCost = quantity * price;

  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (portfolio.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct balance
    portfolio.balance -= totalCost;
    await portfolio.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      symbol,
      name,
      type: 'BUY',
      quantity,
      price
    });

    // Update or create holding
    let holding = await Holding.findOne({ user: req.user._id, symbol });
    
    if (holding) {
      const totalValue = (holding.quantity * holding.averagePrice) + totalCost;
      holding.quantity += quantity;
      holding.averagePrice = totalValue / holding.quantity;
      await holding.save();
    } else {
      holding = await Holding.create({
        user: req.user._id,
        symbol,
        name,
        quantity,
        averagePrice: price
      });
    }

    res.status(201).json(holding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sell stock
// @route   POST /api/v1/holdings/sell
const sellStock = async (req, res) => {
  const { symbol, name, quantity, price } = req.body;
  const totalRevenue = quantity * price;

  try {
    let holding = await Holding.findOne({ user: req.user._id, symbol });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares' });
    }

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      symbol,
      name,
      type: 'SELL',
      quantity,
      price
    });

    // Add balance
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    portfolio.balance += totalRevenue;
    await portfolio.save();

    // Update holding
    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id });
      res.json({ message: 'Position closed' });
    } else {
      await holding.save();
      res.json(holding);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHoldings, buyStock, sellStock };
