import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Search, Eye, TrendingUp, Compass } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { socket, isConnected } = useSocket();

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${API_URL}/stocks`);
      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Socket updates for live tick prices
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePriceTick = (tick) => {
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === tick.symbol
            ? { ...s, price: tick.price, change: tick.change, changePercent: tick.changePercent }
            : s
        )
      );
    };

    socket.on('stockPriceUpdate', handlePriceTick);

    return () => {
      socket.off('stockPriceUpdate', handlePriceTick);
    };
  }, [socket, isConnected]);

  // Filter stocks by client-side search query
  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header text */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Live Stock Market</h2>
          <p className="text-xs text-zinc-500 mt-1">Real-time ticker metrics and sector groupings</p>
        </div>

        {/* Local Table Search Filter */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter list..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-200 placeholder-zinc-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs text-zinc-500">Loading Market Index...</span>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Sector</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Change (%)</th>
                  <th className="px-6 py-4 text-right">Market Cap</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-xs">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-zinc-500">
                      No stocks match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-200">{stock.symbol}</td>
                      <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">{stock.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-750 rounded text-zinc-400 text-[10px]">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200">
                        ₹{stock.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400 font-medium">
                        ₹{stock.marketCap.toLocaleString('en-IN')} Cr
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/stocks/${stock.symbol}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Trade / Chart
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets;
