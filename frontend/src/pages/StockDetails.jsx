import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ChartComponent from '../components/ChartComponent';
import OrderModal from '../components/OrderModal';
import { useSocket } from '../context/SocketContext';
import { usePortfolio } from '../context/PortfolioContext';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockDetails = () => {
  const { symbol } = useParams();
  const formattedSymbol = symbol.toUpperCase();
  const { socket, isConnected } = useSocket();
  const { portfolio } = usePortfolio();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI Service hooks
  const [aiSummary, setAiSummary] = useState(null);
  const [aiPredict, setAiPredict] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  // Order modal triggers
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const fetchStockDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/stocks/${formattedSymbol}`);
      if (res.data.success) {
        setStock(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIService = async () => {
    setAiLoading(true);
    try {
      const [sumRes, predRes] = await Promise.all([
        axios.get(`${API_URL}/ai/summary/${formattedSymbol}`),
        axios.get(`${API_URL}/ai/predict/${formattedSymbol}`)
      ]);
      if (sumRes.data.success) setAiSummary(sumRes.data.data);
      if (predRes.data.success) setAiPredict(predRes.data.data);
    } catch (err) {
      console.error('Error querying AI analysis endpoints:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStockDetails();
    fetchAIService();
  }, [symbol]);

  // Live price tick overrides
  useEffect(() => {
    if (!socket || !isConnected || !stock) return;

    const handleTickUpdate = (tick) => {
      if (tick.symbol === formattedSymbol) {
        setStock((prev) => ({
          ...prev,
          price: tick.price,
          change: tick.change,
          changePercent: tick.changePercent,
          volume: tick.volume,
        }));
      }
    };

    socket.on('stockPriceUpdate', handleTickUpdate);

    return () => {
      socket.off('stockPriceUpdate', handleTickUpdate);
    };
  }, [socket, isConnected, stock, symbol]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs text-zinc-500">Loading Ticker Workspace...</span>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-zinc-300">Ticker Not Found</h3>
        <Link to="/markets" className="text-indigo-400 hover:underline text-xs">Return to Market List</Link>
      </div>
    );
  }

  // Calculate if user holds stock
  const holding = portfolio?.holdings?.find((h) => h.symbol === formattedSymbol);
  const holdingQty = holding ? holding.quantity : 0;

  return (
    <div className="space-y-8 fade-in">
      {/* breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/markets" className="hover:text-zinc-300 transition-colors">Market</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-400 font-semibold">{stock.symbol}</span>
      </div>

      {/* Header Widget */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-zinc-100">{stock.symbol}</h1>
            <span className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-medium rounded-lg uppercase tracking-wider">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{stock.name}</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Action trigger */}
          <button
            onClick={() => setIsTradeOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-xs tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/10"
          >
            BUY / SELL STOCK
          </button>
        </div>
      </div>

      {/* Live Quotes Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Last Price</span>
          <span className="text-xl font-extrabold text-zinc-200 block mt-2">₹{stock.price.toFixed(2)}</span>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Day Change</span>
          <span className={`text-xl font-extrabold block mt-2 ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Market Cap</span>
          <span className="text-xl font-extrabold text-zinc-200 block mt-2">₹{stock.marketCap.toLocaleString('en-IN')} Cr</span>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Holding Balance</span>
          <span className="text-xl font-extrabold text-indigo-400 block mt-2">{holdingQty} Shares</span>
        </div>
      </div>

      {/* Chart container */}
      <ChartComponent data={stock.history} symbol={stock.symbol} />

      {/* Columns: Descriptions vs AI summary and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description & Overview */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
          <h3 className="font-bold text-sm text-zinc-200">Company Overview</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">{stock.overview}</p>

          <div className="border-t border-zinc-800/80 pt-6">
            <h4 className="font-bold text-xs text-zinc-300 mb-4">Market Stats</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-850/60">
                <span className="text-zinc-500">Sector</span>
                <span className="text-zinc-300 font-medium">{stock.sector}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850/60">
                <span className="text-zinc-500">Previous Close</span>
                <span className="text-zinc-300 font-medium">₹{stock.previousClose.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850/60">
                <span className="text-zinc-500">Volume</span>
                <span className="text-zinc-300 font-medium">{stock.volume.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850/60">
                <span className="text-zinc-500">Ownership</span>
                <span className="text-zinc-300 font-medium">{holdingQty > 0 ? `${holdingQty} Shares Owned` : 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI summary & Alert box */}
        <div className="space-y-6">
          {/* AI Insights Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10">
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">AI Technical Analysis</h3>
            </div>

            {aiLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-xs text-zinc-500">
                <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span>Consulting AI Engine...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">Technical Signal</span>
                  <span className="font-bold text-zinc-200 mt-1 block leading-relaxed">{aiSummary.recommendation}</span>
                </div>
                <p className="text-zinc-400 leading-relaxed font-light text-[11px]">
                  {aiSummary.technicalSummary}
                </p>
                <p className="text-zinc-400 leading-relaxed font-light text-[11px]">
                  {aiSummary.sentimentSummary}
                </p>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-6 text-center">AI analysis temporarily offline.</div>
            )}
          </div>

          {/* AI Predictive Path */}
          {!aiLoading && aiPredict && (
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <TrendingUp className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider">5-Day ML Prediction</h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Forecast direction</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    aiPredict.direction === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {aiPredict.direction} ({aiPredict.confidence}% Conf)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Current price</span>
                  <span className="text-zinc-300 font-semibold">₹{aiPredict.currentPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">5-day target</span>
                  <span className="text-zinc-100 font-bold">₹{aiPredict.predictedPrice}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade execution modal */}
      <OrderModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        stock={stock}
      />
    </div>
  );
};

export default StockDetails;
