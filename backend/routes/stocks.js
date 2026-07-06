const express = require('express');
const router = express.Router();
const { getStocks, getStockBySymbol, getGainersLosers } = require('../controllers/stockController');

router.get('/', getStocks);
router.get('/gainers-losers', getGainersLosers);
router.get('/:symbol', getStockBySymbol);

module.exports = router;
