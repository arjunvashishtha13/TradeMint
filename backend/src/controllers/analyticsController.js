const analyticsService = require('../services/analyticsService');
const portfolioService = require('../services/portfolioService');

const getDashboardData = async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolioSummary(req.user._id);
    const analytics = await analyticsService.getPortfolioAnalytics(req.user._id);
    
    res.json({
      portfolio,
      analytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarketData = async (req, res) => {
  try {
    // Mocking market data since we don't have a real API connected
    res.json({
      topGainers: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.5 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 450.20, change: 5.2 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.10, change: 1.8 }
      ],
      topLosers: [
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.30, change: -3.4 },
        { symbol: 'META', name: 'Meta Platforms Inc.', price: 290.40, change: -1.5 }
      ],
      mostActive: [
        { symbol: 'AMZN', name: 'Amazon.com Inc.', volume: '50M' },
        { symbol: 'AMD', name: 'Advanced Micro Devices', volume: '45M' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardData, getMarketData };
