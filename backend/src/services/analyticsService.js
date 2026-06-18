const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const marketService = require('./marketService');

const getPortfolioAnalytics = async (userId) => {
  const holdings = await Holding.find({ user: userId });
  const sectorMap = {};
  
  let totalInvested = 0;
  let totalCurrentValue = 0;
  
  // For Insights
  let bestStock = null;
  let worstStock = null;
  let largestHolding = null;

  // Fetch real-time quotes in parallel for all holdings
  const holdingsWithStats = await Promise.all(holdings.map(async (h) => {
    let currentPrice = h.averagePrice;
    let sector = 'Unknown';
    try {
      const quote = await marketService.getQuote(h.symbol);
      currentPrice = quote.price || h.averagePrice;
      
      const profile = await marketService.getProfile(h.symbol);
      sector = profile.finnhubIndustry || 'General';
    } catch (error) {
      console.error(`Failed to fetch market data for ${h.symbol}`);
    }

    const value = h.quantity * currentPrice;
    const invested = h.quantity * h.averagePrice;
    const returnPct = ((currentPrice - h.averagePrice) / h.averagePrice) * 100;
    
    return {
      ...h.toObject(),
      currentPrice,
      currentValue: value,
      invested,
      returnPct,
      sector
    };
  }));

  holdingsWithStats.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
    totalInvested += h.invested;
    totalCurrentValue += h.currentValue;

    // Track best/worst/largest
    if (!largestHolding || h.currentValue > largestHolding.currentValue) largestHolding = h;
    if (!bestStock || h.returnPct > bestStock.returnPct) bestStock = h;
    if (!worstStock || h.returnPct < worstStock.returnPct) worstStock = h;
  });

  const sectorDistribution = Object.keys(sectorMap).map(name => ({
    name,
    value: parseFloat(((sectorMap[name] / totalCurrentValue) * 100).toFixed(2)) || 0
  }));

  // Calculate HHI (Herfindahl-Hirschman Index) for diversification
  let hhi = 0;
  if (totalCurrentValue > 0) {
    holdingsWithStats.forEach(h => {
      const share = (h.currentValue / totalCurrentValue) * 100;
      hhi += Math.pow(share, 2);
    });
  } else {
    hhi = 10000; // 0 holdings = worst diversification score theoretically for display
  }
  
  // Normalize HHI to 0-100 score where 100 is perfectly diversified
  let diversificationScore = 100 - (hhi / 100);
  if (totalCurrentValue === 0) diversificationScore = 0;
  diversificationScore = Math.max(0, Math.min(100, diversificationScore));
  
  // Define Risk Tier
  let riskTier = 'High Risk';
  if (diversificationScore >= 80) riskTier = 'Excellent';
  else if (diversificationScore >= 60) riskTier = 'Good';
  else if (diversificationScore >= 40) riskTier = 'Moderate';

  return {
    sectorDistribution,
    diversificationScore: parseFloat(diversificationScore.toFixed(1)) || 0,
    riskTier,
    totalInvested,
    totalCurrentValue,
    insights: {
      bestStock: bestStock ? { symbol: bestStock.symbol, returnPct: bestStock.returnPct } : null,
      worstStock: worstStock ? { symbol: worstStock.symbol, returnPct: worstStock.returnPct } : null,
      largestHolding: largestHolding ? { symbol: largestHolding.symbol, value: largestHolding.currentValue } : null
    },
    // Adding holdings payload here so PortfolioPage can directly consume the real prices
    portfolio: { holdings: holdingsWithStats }
  };
};

module.exports = { getPortfolioAnalytics };
