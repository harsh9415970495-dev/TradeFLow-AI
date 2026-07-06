import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const PortfolioContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState({ holdings: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const { user, updateBalance } = useAuth();
  const { socket, isConnected } = useSocket();

  const fetchPortfolio = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/portfolio`);
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else {
      setPortfolio({ holdings: [], stats: {} });
      setLoading(false);
    }
  }, [user]);

  // Handle live WebSocket price updates to recalculate portfolio value instantly
  useEffect(() => {
    if (!socket || !isConnected || portfolio.holdings.length === 0) return;

    const handlePriceUpdate = (update) => {
      setPortfolio((prev) => {
        const { holdings, stats } = prev;
        
        // Find if this symbol is in holdings
        const holdingIndex = holdings.findIndex((h) => h.symbol === update.symbol);
        if (holdingIndex === -1) return prev;

        const updatedHoldings = [...holdings];
        const holding = updatedHoldings[holdingIndex];

        // Recalculate holding
        const prevPrice = update.price - update.change; // simple backtrack
        const currentVal = holding.quantity * update.price;
        const totalPL = currentVal - holding.investmentValue;
        const todayPL = holding.quantity * update.change;

        updatedHoldings[holdingIndex] = {
          ...holding,
          currentPrice: update.price,
          currentValue: Math.round(currentVal * 100) / 100,
          totalProfitLoss: Math.round(totalPL * 100) / 100,
          totalProfitLossPercent: Math.round((totalPL / holding.investmentValue) * 10000) / 100,
          todayProfitLoss: Math.round(todayPL * 100) / 100,
          changePercent: update.changePercent,
        };

        // Recalculate overall stats
        let totalInvestment = 0;
        let totalCurrentVal = 0;
        let overallTodayPL = 0;

        updatedHoldings.forEach((h) => {
          totalInvestment += h.investmentValue;
          totalCurrentVal += h.currentValue;
          overallTodayPL += h.todayProfitLoss;
        });

        const overallPL = totalCurrentVal - totalInvestment;
        const perfPct = totalInvestment > 0 ? (overallPL / totalInvestment) * 100 : 0;

        return {
          holdings: updatedHoldings,
          stats: {
            ...stats,
            totalPortfolioValue: Math.round((totalCurrentVal + stats.availableCash) * 100) / 100,
            totalInvestment: Math.round(totalInvestment * 100) / 100,
            totalCurrentHoldingsValue: Math.round(totalCurrentVal * 100) / 100,
            todayProfitLoss: Math.round(overallTodayPL * 100) / 100,
            totalProfitLoss: Math.round(overallPL * 100) / 100,
            performancePercent: Math.round(perfPct * 100) / 100,
          },
        };
      });
    };

    socket.on('stockPriceUpdate', handlePriceUpdate);

    return () => {
      socket.off('stockPriceUpdate', handlePriceUpdate);
    };
  }, [socket, isConnected, portfolio.holdings]);

  // Handle limit order executions
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleOrderExecution = (data) => {
      console.log('Limit order filled live, reloading portfolio...', data);
      fetchPortfolio();
      // Update cash balance locally
      if (data.order && data.order.type === 'BUY') {
        const cost = data.order.quantity * (data.order.limitPrice || 0);
        if (user) updateBalance(user.cashBalance - cost);
      } else if (data.order && data.order.type === 'SELL') {
        const credit = data.order.quantity * (data.order.limitPrice || 0);
        if (user) updateBalance(user.cashBalance + credit);
      }
    };

    socket.on('orderExecuted', handleOrderExecution);

    return () => {
      socket.off('orderExecuted', handleOrderExecution);
    };
  }, [socket, isConnected, user]);

  return (
    <PortfolioContext.Provider value={{ portfolio, loading, refreshPortfolio: fetchPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
