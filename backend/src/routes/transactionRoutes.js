const express = require('express');
const router = express.Router();
const { getTransactions, updateTransactionNotes, executeTrade } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTransactions);
router.post('/trade', protect, executeTrade);
router.put('/:id/notes', protect, updateTransactionNotes);

module.exports = router;
