const { prisma } = require('../config/db');

// @desc    Get user alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { stock: true }
    });
    
    const formatted = alerts.map(a => ({
      ...a,
      symbol: a.stock.symbol
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an alert
// @route   POST /api/alerts/create
// @access  Private
const createAlert = async (req, res) => {
  const { symbol, targetPrice, condition } = req.body;

  if (!symbol || !targetPrice || !condition) {
    return res.status(400).json({ success: false, message: 'Please provide symbol, targetPrice, and condition' });
  }

  try {
    const formattedSymbol = symbol.toUpperCase();
    
    // Check if stock exists
    const stock = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        stockId: stock.id,
        targetPrice: Number(targetPrice),
        condition, // ABOVE or BELOW
      }
    });

    const formattedAlert = {
      ...alert,
      symbol: stock.symbol
    };

    return res.status(201).json({ success: true, message: 'Alert created successfully', data: formattedAlert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel/Delete an alert
// @route   DELETE /api/alerts/cancel/:id
// @access  Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await prisma.alert.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await prisma.alert.delete({ where: { id: alert.id } });

    return res.json({ success: true, message: 'Alert cancelled successfully', data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
};
