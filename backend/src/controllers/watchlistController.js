const Watchlist = require('../models/Watchlist');

const getAllWatchlists = async (req, res) => {
  try {
    let watchlists = await Watchlist.find({ user: req.user._id });
    if (watchlists.length === 0) {
      // Create a default watchlist
      const defaultWatchlist = await Watchlist.create({ user: req.user._id, name: 'Main Watchlist', symbols: [] });
      watchlists = [defaultWatchlist];
    }
    res.json(watchlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWatchlist = async (req, res) => {
  const { name } = req.body;
  try {
    const newWatchlist = await Watchlist.create({ 
      user: req.user._id, 
      name: name || 'New Watchlist', 
      symbols: [] 
    });
    res.status(201).json(newWatchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });
    await watchlist.deleteOne();
    res.json({ message: 'Watchlist removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renameWatchlist = async (req, res) => {
  const { name } = req.body;
  try {
    const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });
    watchlist.name = name;
    await watchlist.save();
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const marketService = require('../services/marketService');

const addSymbolToWatchlist = async (req, res) => {
  const { symbol, name } = req.body;
  try {
    const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

    const exists = watchlist.symbols.find(s => s.symbol === symbol);
    if (exists) return res.status(400).json({ message: 'Symbol already in watchlist' });

    // Validate symbol via Finnhub
    const profile = await marketService.getProfile(symbol);
    if (!profile || Object.keys(profile).length === 0 || !profile.name) {
      // Finnhub returns an empty object for invalid symbols
      return res.status(400).json({ message: `Invalid stock symbol: ${symbol}` });
    }

    watchlist.symbols.push({ symbol: symbol.toUpperCase(), name: profile.name });
    await watchlist.save();
    res.status(201).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeSymbolFromWatchlist = async (req, res) => {
  const symbolToRemove = req.params.symbol;
  try {
    const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

    watchlist.symbols = watchlist.symbols.filter(s => s.symbol !== symbolToRemove);
    await watchlist.save();
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllWatchlists, 
  createWatchlist, 
  deleteWatchlist, 
  addSymbolToWatchlist, 
  removeSymbolFromWatchlist,
  renameWatchlist
};
