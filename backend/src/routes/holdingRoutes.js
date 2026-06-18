const express = require('express');
const router = express.Router();
const { getHoldings, buyStock, sellStock } = require('../controllers/holdingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHoldings);
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);

module.exports = router;
