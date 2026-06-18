const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const Notification = require('../models/Notification');
const User = require('../models/User');

const buyStock = async (userId, symbol, name, quantity, price) => {
  const totalCost = quantity * price;
  const portfolio = await Portfolio.findOne({ user: userId });

  if (portfolio.balance < totalCost) {
    throw new Error('Insufficient funds');
  }

  portfolio.balance -= totalCost;
  await portfolio.save();

  const transaction = await Transaction.create({
    user: userId,
    symbol,
    name,
    type: 'BUY',
    quantity,
    price
  });

  let holding = await Holding.findOne({ user: userId, symbol });
  if (holding) {
    const totalValue = (holding.quantity * holding.averagePrice) + totalCost;
    holding.quantity += quantity;
    holding.averagePrice = totalValue / holding.quantity;
    await holding.save();
  } else {
    holding = await Holding.create({
      user: userId,
      symbol,
      name,
      quantity,
      averagePrice: price
    });
  }

  // Update User Activity
  await User.findByIdAndUpdate(userId, {
    $inc: { 'activityMetrics.tradesExecuted': 1, 'activityMetrics.totalVolume': totalCost }
  });

  await Notification.create({
    user: userId,
    title: 'Trade Confirmation',
    message: `Bought ${quantity} shares of ${symbol} at $${price}`,
    type: 'TRADE_CONFIRMATION'
  });

  return holding;
};

const sellStock = async (userId, symbol, name, quantity, price) => {
  const totalRevenue = quantity * price;
  let holding = await Holding.findOne({ user: userId, symbol });

  if (!holding || holding.quantity < quantity) {
    throw new Error('Insufficient shares');
  }

  const transaction = await Transaction.create({
    user: userId,
    symbol,
    name,
    type: 'SELL',
    quantity,
    price
  });

  const portfolio = await Portfolio.findOne({ user: userId });
  portfolio.balance += totalRevenue;
  await portfolio.save();

  const isProfitable = price > holding.averagePrice;

  holding.quantity -= quantity;
  if (holding.quantity === 0) {
    await Holding.deleteOne({ _id: holding._id });
  } else {
    await holding.save();
  }

  // Update User Activity
  await User.findByIdAndUpdate(userId, {
    $inc: { 
      'activityMetrics.tradesExecuted': 1, 
      'activityMetrics.totalVolume': totalRevenue,
      ...(isProfitable && { 'activityMetrics.profitableTrades': 1 })
    }
  });

  await Notification.create({
    user: userId,
    title: 'Trade Confirmation',
    message: `Sold ${quantity} shares of ${symbol} at $${price}`,
    type: 'TRADE_CONFIRMATION'
  });

  return holding;
};

module.exports = { buyStock, sellStock };
