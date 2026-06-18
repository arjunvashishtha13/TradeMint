const express = require('express');
const router = express.Router();
const { getQuote, getProfile, searchSymbols } = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/quote/:symbol', protect, getQuote);
router.get('/profile/:symbol', protect, getProfile);
router.get('/search', protect, searchSymbols);

module.exports = router;
