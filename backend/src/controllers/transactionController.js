const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const marketService = require('../services/marketService');

// @desc    Get user transactions with pagination and sorting
// @route   GET /api/v1/transactions
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: order };

    const filter = { user: req.user._id };

    if (req.query.search) {
      filter.symbol = { $regex: req.query.search, $options: 'i' };
    }

    const transactions = await Transaction.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction notes
// @route   PUT /api/v1/transactions/:id/notes
const updateTransactionNotes = async (req, res) => {
  try {
    const { notes, reason } = req.body;
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (notes !== undefined) transaction.notes = notes;
    if (reason !== undefined) transaction.reason = reason;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Execute a Trade (Buy/Sell)
// @route   POST /api/v1/transactions/trade
const executeTrade = async (req, res) => {
  const { symbol, type, quantity } = req.body;
  const numQuantity = Number(quantity);

  if (!symbol || !type || !numQuantity || numQuantity <= 0) {
    return res.status(400).json({ message: 'Invalid trade parameters' });
  }

  try {
    // 1. Fetch current market price
    const quote = await marketService.getQuote(symbol);
    const profile = await marketService.getProfile(symbol);
    
    if (!quote || !quote.price || quote.price <= 0) {
      return res.status(400).json({ message: 'Could not fetch live market price' });
    }

    const price = quote.price;
    const totalValue = price * numQuantity;
    const userId = req.user._id;

    // 2. Fetch Portfolio & Holding
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    
    let holding = await Holding.findOne({ user: userId, symbol: symbol.toUpperCase() });

    // 3. Process BUY
    if (type.toUpperCase() === 'BUY') {
      if (portfolio.balance < totalValue) {
        return res.status(400).json({ message: 'Insufficient funds for this trade' });
      }

      portfolio.balance -= totalValue;

      if (holding) {
        const totalInvested = (holding.averagePrice * holding.quantity) + totalValue;
        const newQuantity = holding.quantity + numQuantity;
        holding.averagePrice = totalInvested / newQuantity;
        holding.quantity = newQuantity;
        await holding.save();
      } else {
        await Holding.create({
          user: userId,
          symbol: symbol.toUpperCase(),
          name: profile.name || `${symbol.toUpperCase()} Corp`,
          quantity: numQuantity,
          averagePrice: price
        });
      }
    } 
    // 4. Process SELL
    else if (type.toUpperCase() === 'SELL') {
      if (!holding || holding.quantity < numQuantity) {
        return res.status(400).json({ message: 'Insufficient shares to sell' });
      }

      portfolio.balance += totalValue;
      holding.quantity -= numQuantity;

      if (holding.quantity === 0) {
        await holding.deleteOne();
      } else {
        await holding.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid trade type' });
    }

    // 5. Create Transaction Record
    await portfolio.save();
    
    const transaction = await Transaction.create({
      user: userId,
      symbol: symbol.toUpperCase(),
      name: profile.name || `${symbol.toUpperCase()} Corp`,
      type: type.toUpperCase(),
      quantity: numQuantity,
      price: price,
      reason: `Executed at market price: $${price}`
    });

    res.status(201).json({ message: 'Trade executed successfully', transaction });

  } catch (error) {
    console.error('Trade Execution Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTransactions, updateTransactionNotes, executeTrade };
