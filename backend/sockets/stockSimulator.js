const { prisma } = require('../config/db');
const { broadcastMarket, sendToUser } = require('./socketManager');

// Helper to check and execute pending limit orders
const checkLimitOrders = async (stock) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        stockId: stock.id,
        status: 'PENDING',
      }
    });

    for (const order of pendingOrders) {
      let isTriggered = false;

      if (order.type === 'BUY' && stock.currentPrice <= order.limitPrice) {
        isTriggered = true;
      } else if (order.type === 'SELL' && stock.currentPrice >= order.limitPrice) {
        isTriggered = true;
      }

      if (isTriggered) {
        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        if (!user) continue;

        if (order.type === 'BUY') {
          const totalCost = order.quantity * stock.currentPrice;
          
          if (user.cashBalance >= totalCost) {
            // Execute Limit Buy
            await prisma.user.update({
              where: { id: user.id },
              data: { cashBalance: user.cashBalance - totalCost }
            });

            let portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } });
            if (!portfolio) {
              portfolio = await prisma.portfolio.create({ data: { userId: user.id, totalValue: 0 } });
            }

            let holding = await prisma.holding.findFirst({
              where: { portfolioId: portfolio.id, stockId: stock.id }
            });

            if (holding) {
              const newQty = holding.quantity + order.quantity;
              const newAvgPrice = Math.round((((holding.averagePrice * holding.quantity) + (stock.currentPrice * order.quantity)) / newQty) * 100) / 100;
              await prisma.holding.update({
                where: { id: holding.id },
                data: { quantity: newQty, averagePrice: newAvgPrice }
              });
            } else {
              await prisma.holding.create({
                data: {
                  portfolioId: portfolio.id,
                  stockId: stock.id,
                  quantity: order.quantity,
                  averagePrice: stock.currentPrice,
                }
              });
            }

            await prisma.transaction.create({
              data: {
                userId: user.id,
                stockId: stock.id,
                type: 'BUY',
                quantity: order.quantity,
                executedPrice: stock.currentPrice,
                totalAmount: totalCost,
              }
            });

            const updatedOrder = await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'EXECUTED',
                price: stock.currentPrice,
                totalAmount: totalCost
              }
            });

            const msg = `Limit BUY for ${order.quantity} shares of ${stock.symbol} executed at ₹${stock.currentPrice}`;
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: 'Order Executed',
                message: msg
              }
            });

            sendToUser(user.id, 'orderExecuted', { order: updatedOrder, message: msg });
            sendToUser(user.id, 'notification', { title: 'Order Executed', message: msg, type: 'ORDER_EXECUTION' });
          } else {
            // Cancel limit buy due to lack of funds when it triggered
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED' }
            });

            const msg = `Limit BUY for ${order.quantity} shares of ${stock.symbol} failed due to insufficient balance.`;
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: 'Order Cancelled',
                message: msg
              }
            });

            sendToUser(user.id, 'notification', { title: 'Order Cancelled', message: msg, type: 'ORDER_EXECUTION' });
          }

        } else if (order.type === 'SELL') {
          let portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } });
          const holding = portfolio ? await prisma.holding.findFirst({
            where: { portfolioId: portfolio.id, stockId: stock.id }
          }) : null;
          
          if (holding && holding.quantity >= order.quantity) {
            // Execute Limit Sell
            const totalCredits = order.quantity * stock.currentPrice;
            await prisma.user.update({
              where: { id: user.id },
              data: { cashBalance: user.cashBalance + totalCredits }
            });

            if (holding.quantity === order.quantity) {
              await prisma.holding.delete({ where: { id: holding.id } });
            } else {
              await prisma.holding.update({
                where: { id: holding.id },
                data: { quantity: holding.quantity - order.quantity }
              });
            }

            await prisma.transaction.create({
              data: {
                userId: user.id,
                stockId: stock.id,
                type: 'SELL',
                quantity: order.quantity,
                executedPrice: stock.currentPrice,
                totalAmount: totalCredits,
              }
            });

            const updatedOrder = await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'EXECUTED',
                price: stock.currentPrice,
                totalAmount: totalCredits
              }
            });

            const msg = `Limit SELL for ${order.quantity} shares of ${stock.symbol} executed at ₹${stock.currentPrice}`;
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: 'Order Executed',
                message: msg
              }
            });

            sendToUser(user.id, 'orderExecuted', { order: updatedOrder, message: msg });
            sendToUser(user.id, 'notification', { title: 'Order Executed', message: msg, type: 'ORDER_EXECUTION' });
          } else {
            // Cancel limit sell due to lack of holdings when it triggered
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED' }
            });

            const msg = `Limit SELL for ${order.quantity} shares of ${stock.symbol} failed due to insufficient holdings.`;
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: 'Order Cancelled',
                message: msg
              }
            });

            sendToUser(user.id, 'notification', { title: 'Order Cancelled', message: msg, type: 'ORDER_EXECUTION' });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking limit orders:', error.message);
  }
};

// Helper to check target price alerts
const checkPriceAlerts = async (stock) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        stockId: stock.id,
      }
    });

    for (const alert of alerts) {
      let isTriggered = false;

      if (alert.condition === 'ABOVE' && stock.currentPrice >= alert.targetPrice) {
        isTriggered = true;
      } else if (alert.condition === 'BELOW' && stock.currentPrice <= alert.targetPrice) {
        isTriggered = true;
      }

      if (isTriggered) {
        await prisma.alert.delete({ where: { id: alert.id } });

        const msg = `${stock.symbol} has crossed your target price of ₹${alert.targetPrice} (Current: ₹${stock.currentPrice})`;
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            title: 'Price Alert Triggered',
            message: msg
          }
        });

        sendToUser(alert.userId, 'notification', {
          title: 'Price Alert Triggered',
          message: msg,
          type: 'ALERT',
        });
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error.message);
  }
};

// Start the stock simulator loops
const startStockSimulator = () => {
  console.log('Stock Price Simulator started...');
  
  setInterval(async () => {
    try {
      const stocks = await prisma.stock.findMany();
      
      for (const stock of stocks) {
        // Random walk percentage change (-0.6% to +0.6%)
        const changePct = (Math.random() - 0.495) * 0.012; 
        const newPrice = Math.round(stock.currentPrice * (1 + changePct) * 100) / 100;
        
        // Boundaries
        const finalPrice = Math.max(5.0, newPrice);
        
        const change = Math.round((finalPrice - stock.previousClose) * 100) / 100;
        const changePercent = Math.round((change / stock.previousClose) * 10000) / 100;
        
        const history = stock.history ? stock.history : [];
        if (history.length > 0) {
          const lastCandle = history[history.length - 1];
          lastCandle.close = finalPrice;
          if (finalPrice > lastCandle.high) lastCandle.high = finalPrice;
          if (finalPrice < lastCandle.low) lastCandle.low = finalPrice;
        }

        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            currentPrice: finalPrice,
            change,
            changePercent,
            history
          }
        });

        // Broadcast to clients listening to global market updates
        broadcastMarket('stockPriceUpdate', {
          symbol: stock.symbol,
          name: stock.companyName,
          price: finalPrice,
          change: change,
          changePercent: changePercent,
          volume: stock.volume,
          high: history.length > 0 ? history[history.length - 1].high : finalPrice,
          low: history.length > 0 ? history[history.length - 1].low : finalPrice,
        });

        // Use updated stock object for trigger checks
        const updatedStock = { ...stock, currentPrice: finalPrice };
        await checkLimitOrders(updatedStock);
        await checkPriceAlerts(updatedStock);
      }
    } catch (err) {
      console.error('Error in Stock Simulator Tick:', err.message);
    }
  }, 2500); // Ticks every 2.5 seconds
};

module.exports = {
  startStockSimulator,
};
