const marketService = require('../services/marketService');

// @desc    Get real-time stock quote
// @route   GET /api/v1/market/quote/:symbol
const getQuote = async (req, res) => {
  try {
    const quote = await marketService.getQuote(req.params.symbol);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get company profile
// @route   GET /api/v1/market/profile/:symbol
const getProfile = async (req, res) => {
  try {
    const profile = await marketService.getProfile(req.params.symbol);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search for stock symbols
// @route   GET /api/v1/market/search?q=
const searchSymbols = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const results = await marketService.searchSymbols(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuote,
  getProfile,
  searchSymbols
};
