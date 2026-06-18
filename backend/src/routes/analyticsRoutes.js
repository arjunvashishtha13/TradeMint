const express = require('express');
const router = express.Router();
const { getDashboardData, getMarketData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardData);
router.get('/market', protect, getMarketData);

module.exports = router;
