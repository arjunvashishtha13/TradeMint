const express = require('express');
const router = express.Router();
const { 
  getAllWatchlists, 
  createWatchlist, 
  deleteWatchlist, 
  addSymbolToWatchlist, 
  removeSymbolFromWatchlist,
  renameWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllWatchlists);
router.post('/create', protect, createWatchlist);
router.delete('/delete/:id', protect, deleteWatchlist);
router.put('/rename/:id', protect, renameWatchlist);
router.post('/:id', protect, addSymbolToWatchlist);
router.delete('/:id/:symbol', protect, removeSymbolFromWatchlist);

module.exports = router;
