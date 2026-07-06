const express = require('express');
const router = express.Router();
const { getWatchlist, addStock, removeStock } = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWatchlist);
router.post('/add', protect, addStock);
router.post('/remove', protect, removeStock);

module.exports = router;
