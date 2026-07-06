import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Eye, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const { socket, isConnected } = useSocket();

  const fetchWatchlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/watchlist`);
      if (res.data.success) setWatchlist(res.data.data);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWatchlist(); }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handleTick = (tick) => {
      setWatchlist(prev => prev.map(s =>
        s.symbol === tick.symbol ? { ...s, price: tick.price, change: tick.change, changePercent: tick.changePercent } : s
      ));
    };
    socket.on('stockPriceUpdate', handleTick);
    return () => socket.off('stockPriceUpdate', handleTick);
  }, [socket, isConnected]);

  const removeFromWatchlist = async (symbol) => {
    setRemoving(symbol);
    try {
      await axios.delete(`${API_URL}/watchlist/${symbol}`);
      setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-xs text-zinc-500">Loading Watchlist...</span>
    </div>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">My Watchlist</h2>
          <p className="text-xs text-zinc-500 mt-1">Track your favourite stocks in real-time</p>
        </div>
        <Link
          to="/markets"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" /> Add Stocks
        </Link>
      </div>

      {/* Watchlist Grid */}
      {watchlist.length === 0 ? (
        <div className="glass-panel rounded-2xl py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
          <Eye className="w-12 h-12 text-zinc-700" />
          <p className="text-sm font-medium">Your watchlist is empty</p>
          <Link to="/markets" className="text-xs text-indigo-400 hover:underline font-semibold">Browse Markets →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="glass-card p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/stocks/${stock.symbol}`} className="font-bold text-zinc-100 hover:text-indigo-400 transition-colors text-sm">
                    {stock.symbol}
                  </Link>
                  <span className="text-[10px] text-zinc-500 block mt-0.5 truncate max-w-[160px]">{stock.name}</span>
                </div>
                <button
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  disabled={removing === stock.symbol}
                  className="p-1.5 rounded-lg hover:bg-red-950/40 hover:text-red-400 text-zinc-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xl font-extrabold text-zinc-100">₹{stock.price?.toFixed(2)}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {stock.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">{stock.sector}</span>
                <Link
                  to={`/stocks/${stock.symbol}`}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  View Chart →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
