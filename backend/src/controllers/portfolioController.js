const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');

// @desc    Get user portfolio
// @route   GET /api/v1/portfolio
const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id });
    }

    const holdings = await Holding.find({ user: req.user._id });

    // Calculate total investment and current value
    let totalInvestment = 0;
    let currentValue = 0; // Simplified without real-time price API

    holdings.forEach(h => {
      totalInvestment += (h.quantity * h.averagePrice);
      currentValue += (h.quantity * h.averagePrice); // Assuming price = avgPrice for now
    });

    res.json({
      balance: portfolio.balance,
      totalInvestment,
      currentValue,
      totalPortfolioValue: portfolio.balance + currentValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio };
