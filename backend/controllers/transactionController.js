const { prisma } = require('../config/db');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { stock: true }
    });
    
    const formattedTransactions = transactions.map(t => ({
      ...t,
      symbol: t.stock.symbol
    }));

    return res.json({ success: true, count: formattedTransactions.length, data: formattedTransactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserTransactions,
};
