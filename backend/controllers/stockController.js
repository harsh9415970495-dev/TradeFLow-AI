const { prisma } = require('../config/db');

// @desc    Get all stocks with search/filter
// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};
    if (search) {
      query = {
        OR: [
          { symbol: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { sector: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Exclude the long history array in list view for performance
    const stocks = await prisma.stock.findMany({
      where: query,
      select: {
        id: true,
        symbol: true,
        companyName: true,
        sector: true,
        currentPrice: true,
        previousClose: true,
        change: true,
        changePercent: true,
        volume: true,
        marketCap: true,
        overview: true
      }
    });
    
    // Map properties for frontend compatibility
    const formattedStocks = stocks.map(s => ({
      ...s,
      name: s.companyName,
      price: s.currentPrice
    }));

    return res.json({ success: true, count: formattedStocks.length, data: formattedStocks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
const getStockBySymbol = async (req, res) => {
  try {
    const stock = await prisma.stock.findUnique({ where: { symbol: req.params.symbol.toUpperCase() } });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    
    const formattedStock = {
      ...stock,
      name: stock.companyName,
      price: stock.currentPrice
    };
    
    return res.json({ success: true, data: formattedStock });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top gainers & losers
// @route   GET /api/stocks/gainers-losers
// @access  Public
const getGainersLosers = async (req, res) => {
  try {
    const selectFields = {
      id: true,
      symbol: true,
      companyName: true,
      sector: true,
      currentPrice: true,
      previousClose: true,
      change: true,
      changePercent: true,
      volume: true,
      marketCap: true,
      overview: true
    };

    const gainers = await prisma.stock.findMany({
      orderBy: { changePercent: 'desc' },
      take: 3,
      select: selectFields
    });
    
    const losers = await prisma.stock.findMany({
      orderBy: { changePercent: 'asc' },
      take: 3,
      select: selectFields
    });

    const formatStocks = (arr) => arr.map(s => ({
      ...s,
      name: s.companyName,
      price: s.currentPrice
    }));

    return res.json({
      success: true,
      gainers: formatStocks(gainers),
      losers: formatStocks(losers),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  getGainersLosers,
};
