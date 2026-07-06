const { prisma } = require('../config/db');

// @desc    Place a BUY or SELL order (MARKET or LIMIT)
// @route   POST /api/orders/place
// @access  Private
const placeOrder = async (req, res) => {
  const { symbol, type, orderType, quantity, limitPrice } = req.body;

  if (!symbol || !type || !orderType || !quantity) {
    return res.status(400).json({ success: false, message: 'Please add all required fields' });
  }

  const qty = Number(quantity);
  if (qty <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
  }

  try {
    const formattedSymbol = symbol.toUpperCase();
    const stock = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const price = stock.currentPrice;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Find or create Portfolio
    let portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } });
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({ data: { userId: user.id, totalValue: 0 } });
    }

    if (orderType === 'MARKET') {
      if (type === 'BUY') {
        const totalCost = qty * price;
        if (user.cashBalance < totalCost) {
          return res.status(400).json({ success: false, message: 'Insufficient cash balance' });
        }

        // Deduct balance
        await prisma.user.update({
          where: { id: user.id },
          data: { cashBalance: user.cashBalance - totalCost }
        });

        // Update Holding
        let holding = await prisma.holding.findFirst({
          where: { portfolioId: portfolio.id, stockId: stock.id }
        });

        if (holding) {
          const newQty = holding.quantity + qty;
          const newAvgPrice = ((holding.averagePrice * holding.quantity) + (price * qty)) / newQty;
          await prisma.holding.update({
            where: { id: holding.id },
            data: { quantity: newQty, averagePrice: Math.round(newAvgPrice * 100) / 100 }
          });
        } else {
          await prisma.holding.create({
            data: {
              portfolioId: portfolio.id,
              stockId: stock.id,
              quantity: qty,
              averagePrice: price,
            }
          });
        }

        // Log Transaction
        await prisma.transaction.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'BUY',
            quantity: qty,
            executedPrice: price,
            totalAmount: totalCost,
          }
        });

        // Log Order (Executed)
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'BUY',
            orderType: 'MARKET',
            quantity: qty,
            price: price,
            totalAmount: totalCost,
            status: 'EXECUTED',
          }
        });

        return res.status(201).json({
          success: true,
          message: `Market BUY of ${qty} ${formattedSymbol} executed at ₹${price}`,
          order,
          cashBalance: user.cashBalance - totalCost,
        });

      } else if (type === 'SELL') {
        // Find holding
        const holding = await prisma.holding.findFirst({
          where: { portfolioId: portfolio.id, stockId: stock.id }
        });
        
        if (!holding || holding.quantity < qty) {
          return res.status(400).json({ success: false, message: 'Insufficient holdings to sell' });
        }

        const totalCredits = qty * price;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { cashBalance: user.cashBalance + totalCredits }
        });

        // Update holding
        if (holding.quantity === qty) {
          await prisma.holding.delete({ where: { id: holding.id } });
        } else {
          await prisma.holding.update({
            where: { id: holding.id },
            data: { quantity: holding.quantity - qty }
          });
        }

        // Log Transaction
        await prisma.transaction.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'SELL',
            quantity: qty,
            executedPrice: price,
            totalAmount: totalCredits,
          }
        });

        // Log Order
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'SELL',
            orderType: 'MARKET',
            quantity: qty,
            price: price,
            totalAmount: totalCredits,
            status: 'EXECUTED',
          }
        });

        return res.status(201).json({
          success: true,
          message: `Market SELL of ${qty} ${formattedSymbol} executed at ₹${price}`,
          order,
          cashBalance: user.cashBalance + totalCredits,
        });
      }

    } else if (orderType === 'LIMIT') {
      const limit = Number(limitPrice);
      if (!limit || limit <= 0) {
        return res.status(400).json({ success: false, message: 'Please specify a valid limit price' });
      }

      if (type === 'BUY') {
        const estCost = qty * limit;
        if (user.cashBalance < estCost) {
          return res.status(400).json({ success: false, message: `Insufficient cash for limit price of ₹${limit}` });
        }

        // Create Pending order
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'BUY',
            orderType: 'LIMIT',
            limitPrice: limit,
            quantity: qty,
            status: 'PENDING',
          }
        });

        return res.status(201).json({
          success: true,
          message: `Limit BUY order placed for ${qty} ${formattedSymbol} at ₹${limit}`,
          order,
        });

      } else if (type === 'SELL') {
        // Verify they own the shares
        const holding = await prisma.holding.findFirst({
          where: { portfolioId: portfolio.id, stockId: stock.id }
        });
        
        // Sum up already active limit sell order quantities
        const activeLimitSells = await prisma.order.findMany({
          where: {
            userId: user.id,
            stockId: stock.id,
            type: 'SELL',
            status: 'PENDING',
          }
        });
        const pendingQty = activeLimitSells.reduce((sum, o) => sum + o.quantity, 0);

        if (!holding || holding.quantity < (qty + pendingQty)) {
          return res.status(400).json({
            success: false,
            message: `Insufficient holdings. Owned: ${holding ? holding.quantity : 0}, Committed to Sell: ${pendingQty}`,
          });
        }

        const order = await prisma.order.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            type: 'SELL',
            orderType: 'LIMIT',
            limitPrice: limit,
            quantity: qty,
            status: 'PENDING',
          }
        });

        return res.status(201).json({
          success: true,
          message: `Limit SELL order placed for ${qty} ${formattedSymbol} at ₹${limit}`,
          order,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a pending order
// @route   DELETE /api/orders/cancel/:orderId
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    return res.json({ success: true, message: 'Order cancelled successfully', data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user order logs
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      include: { stock: true }
    });
    
    // To maintain compatibility with frontend that expects `symbol` at the top level
    const formattedOrders = orders.map(o => ({
      ...o,
      symbol: o.stock.symbol
    }));

    return res.json({ success: true, count: formattedOrders.length, data: formattedOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  cancelOrder,
  getUserOrders,
};
