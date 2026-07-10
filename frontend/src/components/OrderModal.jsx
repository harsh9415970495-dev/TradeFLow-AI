import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { X, Wallet, TrendingUp, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderModal = ({ isOpen, onClose, stock }) => {
  const { user, updateBalance } = useAuth();
  const { portfolio, refreshPortfolio } = usePortfolio();
  
  const [tab, setTab] = useState('BUY'); // BUY or SELL
  const [orderType, setOrderType] = useState('MARKET'); // MARKET or LIMIT
  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState(stock ? Math.round(stock.price) : 0);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Reset states when stock changes
  useEffect(() => {
    if (stock) {
      setLimitPrice(Math.round(stock.price));
      setStatusMsg({ type: '', text: '' });
      setQty(1);
    }
  }, [stock, isOpen]);

  if (!isOpen || !stock) return null;

  // Retrieve user holding for this stock if any
  const holding = portfolio.holdings.find((h) => h.symbol === stock.symbol);
  const ownedQty = holding ? holding.quantity : 0;

  const currentPrice = stock.price;
  const executionPrice = orderType === 'LIMIT' ? Number(limitPrice) : currentPrice;
  const estimatedTotal = qty * executionPrice;

  // Input validation checks
  const isInsufficientFunds = tab === 'BUY' && estimatedTotal > (user?.cashBalance || 0);
  const isInsufficientHoldings = tab === 'SELL' && qty > ownedQty;
  const isDisabled = qty <= 0 || isInsufficientFunds || isInsufficientHoldings || (orderType === 'LIMIT' && (!limitPrice || limitPrice <= 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled) return;

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_URL}/orders/place`, {
        symbol: stock.symbol,
        type: tab,
        orderType,
        quantity: qty,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: res.data.message });
        
        // Sync local cash balance instantly if market order
        if (orderType === 'MARKET') {
          updateBalance(res.data.cashBalance);
        }
        
        refreshPortfolio();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Order placement failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-100">Trade Panel</h3>
            <p className="text-xs text-zinc-500">{stock.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons (BUY/SELL) */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/20">
          <button
            onClick={() => setTab('BUY')}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider transition-colors ${
              tab === 'BUY'
                ? 'border-b-2 border-emerald-500 text-emerald-500 bg-emerald-500/5'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            BUY / LONG
          </button>
          <button
            onClick={() => setTab('SELL')}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider transition-colors ${
              tab === 'SELL'
                ? 'border-b-2 border-red-500 text-red-500 bg-red-500/5'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Type Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Last Traded Price</label>
              <div className="w-full bg-zinc-950/40 border border-zinc-850 px-3.5 py-2 text-xs text-zinc-300 font-bold rounded-xl flex items-center justify-between">
                <span>₹{stock.price.toFixed(2)}</span>
                <span className={`text-[10px] ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Quantity & Limit Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                {orderType === 'LIMIT' ? 'Limit Price (₹)' : 'Avg Execution Price'}
              </label>
              <input
                type="number"
                step="0.05"
                disabled={orderType === 'MARKET'}
                value={orderType === 'LIMIT' ? limitPrice : Math.round(stock.price * 100) / 100}
                onChange={(e) => setLimitPrice(Math.max(0.05, parseFloat(e.target.value) || 0))}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors ${
                  orderType === 'MARKET' ? 'opacity-50 select-none cursor-not-allowed bg-zinc-950/20' : ''
                }`}
              />
            </div>
          </div>

          {/* Account Metrics helper */}
          <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-zinc-500" />
              <span>Available Cash:</span>
            </div>
            <span className="font-bold text-zinc-200">
              ₹{user?.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>

          {tab === 'SELL' && (
            <div className="px-3 py-1 flex justify-between text-[11px] text-zinc-500">
              <span>Holdings Available:</span>
              <span className="font-semibold text-zinc-300">{ownedQty} shares</span>
            </div>
          )}

          {/* Status Message notifications */}
          {statusMsg.text && (
            <div
              className={`p-3.5 rounded-xl text-xs ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Margin Validation Warnings */}
          {isInsufficientFunds && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              Warning: Insufficient cash balance. Required: ₹{estimatedTotal.toLocaleString('en-IN')}.
            </div>
          )}

          {isInsufficientHoldings && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              Warning: Insufficient stock holdings to sell. Owned: {ownedQty}. Required: {qty}.
            </div>
          )}

          {/* Total Calculation & Action Button */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Est. Total</span>
              <span className="text-base font-bold text-zinc-100">
                ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <button
              type="submit"
              disabled={isDisabled || loading}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider text-white transition-all shadow-lg ${
                tab === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-emerald-500/15 disabled:from-zinc-850 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-red-500/15 disabled:from-zinc-850 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none'
              }`}
            >
              {loading ? 'Executing...' : `PLACE ${tab} ORDER`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default OrderModal;
