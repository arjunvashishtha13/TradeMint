const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');

const getPortfolioSummary = async (userId) => {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: userId });
  }

  const holdings = await Holding.find({ user: userId });

  let totalInvestment = 0;
  let currentValue = 0; // Simulated
  let bestPerforming = null;
  let worstPerforming = null;
  let maxReturn = -Infinity;
  let minReturn = Infinity;

  const enrichedHoldings = holdings.map(h => {
    // In a real app, you'd fetch real-time price here
    const currentPrice = h.averagePrice * (1 + (Math.random() * 0.1 - 0.05)); // +/- 5% random for now
    const investment = h.quantity * h.averagePrice;
    const value = h.quantity * currentPrice;
    const returnPct = ((value - investment) / investment) * 100;

    totalInvestment += investment;
    currentValue += value;

    if (returnPct > maxReturn) {
      maxReturn = returnPct;
      bestPerforming = { symbol: h.symbol, returnPct };
    }
    if (returnPct < minReturn) {
      minReturn = returnPct;
      worstPerforming = { symbol: h.symbol, returnPct };
    }

    return {
      ...h.toObject(),
      currentPrice,
      currentValue: value,
      returnPct,
    };
  });

  return {
    balance: portfolio.balance,
    totalInvestment,
    currentValue,
    totalPortfolioValue: portfolio.balance + currentValue,
    bestPerforming,
    worstPerforming,
    performanceHistory: portfolio.performanceHistory,
    holdings: enrichedHoldings,
  };
};

const updatePortfolioPerformance = async (userId, value) => {
  const portfolio = await Portfolio.findOne({ user: userId });
  if (portfolio) {
    portfolio.performanceHistory.push({
      date: new Date(),
      value,
    });
    await portfolio.save();
  }
};

module.exports = { getPortfolioSummary, updatePortfolioPerformance };
