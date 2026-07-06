const express = require('express');
const router = express.Router();
const { getCompanySummary, getStockPrediction, getMarketSummary, chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/summary/:symbol', protect, getCompanySummary);
router.get('/predict/:symbol', protect, getStockPrediction);
router.get('/market-summary', protect, getMarketSummary);
router.post('/chat', protect, chatWithAI);

module.exports = router;
