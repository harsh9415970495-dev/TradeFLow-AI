const { prisma } = require('../config/db');

// @desc    Get user portfolio holdings and performance summary
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: user.id },
      include: {
        holdings: {
          include: {
            stock: true
          }
        }
      }
    });

    const holdings = portfolio ? portfolio.holdings : [];

    if (holdings.length === 0) {
      return res.json({
        success: true,
        data: {
          holdings: [],
          stats: {
            totalPortfolioValue: user.cashBalance,
            totalInvestment: 0,
            totalCurrentHoldingsValue: 0,
            availableCash: user.cashBalance,
            todayProfitLoss: 0,
            totalProfitLoss: 0,
            performancePercent: 0,
          },
        },
      });
    }

    let totalInvestment = 0;
    let totalCurrentHoldingsValue = 0;
    let todayProfitLoss = 0;

    const holdingsWithLivePrice = holdings.map((h) => {
      const liveStock = h.stock;
      const currentPrice = liveStock ? liveStock.currentPrice : h.averagePrice;
      
      const investmentValue = h.quantity * h.averagePrice;
      const currentValue = h.quantity * currentPrice;
      const totalPL = currentValue - investmentValue;
      const todayPL = liveStock ? (h.quantity * liveStock.change) : 0;

      totalInvestment += investmentValue;
      totalCurrentHoldingsValue += currentValue;
      todayProfitLoss += todayPL;

      return {
        _id: h.id,
        symbol: liveStock ? liveStock.symbol : 'Unknown',
        name: liveStock ? liveStock.companyName : 'Unknown',
        sector: liveStock ? liveStock.sector : 'Unknown',
        quantity: h.quantity,
        avgBuyPrice: h.averagePrice,
        currentPrice,
        investmentValue: Math.round(investmentValue * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        totalProfitLoss: Math.round(totalPL * 100) / 100,
        totalProfitLossPercent: Math.round((totalPL / investmentValue) * 10000) / 100,
        todayProfitLoss: Math.round(todayPL * 100) / 100,
        changePercent: liveStock ? liveStock.changePercent : 0,
      };
    });

    const totalProfitLoss = totalCurrentHoldingsValue - totalInvestment;
    const performancePercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return res.json({
      success: true,
      data: {
        holdings: holdingsWithLivePrice,
        stats: {
          totalPortfolioValue: Math.round((totalCurrentHoldingsValue + user.cashBalance) * 100) / 100,
          totalInvestment: Math.round(totalInvestment * 100) / 100,
          totalCurrentHoldingsValue: Math.round(totalCurrentHoldingsValue * 100) / 100,
          availableCash: user.cashBalance,
          todayProfitLoss: Math.round(todayProfitLoss * 100) / 100,
          totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
          performancePercent: Math.round(performancePercent * 100) / 100,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPortfolio,
};
