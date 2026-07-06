const { prisma } = require('../config/db');

// @desc    Get user watchlist with current stock details
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        stock: true
      }
    });

    const stocks = watchlists.map(w => {
      // Exclude history and format for frontend
      const { history, ...rest } = w.stock;
      return {
        ...rest,
        name: rest.companyName,
        price: rest.currentPrice
      };
    });

    return res.json({ success: true, data: stocks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist/add
// @access  Private
const addStock = async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ success: false, message: 'Please provide a symbol' });
  }

  try {
    const formattedSymbol = symbol.toUpperCase();
    
    // Check if stock exists
    const stockExists = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    if (!stockExists) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const existingEntry = await prisma.watchlist.findFirst({
      where: {
        userId: req.user.id,
        stockId: stockExists.id
      }
    });

    if (existingEntry) {
      return res.status(400).json({ success: false, message: 'Stock already in watchlist' });
    }

    await prisma.watchlist.create({
      data: {
        userId: req.user.id,
        stockId: stockExists.id
      }
    });

    // Return updated watchlist
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: { stock: true }
    });

    const updatedStocks = watchlists.map(w => {
      const { history, ...rest } = w.stock;
      return { ...rest, name: rest.companyName, price: rest.currentPrice };
    });

    return res.json({ success: true, message: 'Stock added to watchlist', data: updatedStocks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove stock from watchlist
// @route   POST /api/watchlist/remove
// @access  Private
const removeStock = async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ success: false, message: 'Please provide a symbol' });
  }

  try {
    const formattedSymbol = symbol.toUpperCase();
    
    const stockExists = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    
    if (stockExists) {
      const existingEntry = await prisma.watchlist.findFirst({
        where: {
          userId: req.user.id,
          stockId: stockExists.id
        }
      });
      
      if (existingEntry) {
        await prisma.watchlist.delete({ where: { id: existingEntry.id } });
      } else {
        return res.status(400).json({ success: false, message: 'Stock not in watchlist' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    // Return updated watchlist
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: { stock: true }
    });

    const updatedStocks = watchlists.map(w => {
      const { history, ...rest } = w.stock;
      return { ...rest, name: rest.companyName, price: rest.currentPrice };
    });

    return res.json({ success: true, message: 'Stock removed from watchlist', data: updatedStocks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWatchlist,
  addStock,
  removeStock,
};
