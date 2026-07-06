import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Brain, Sparkles, TrendingUp, TrendingDown,
  BarChart2, Zap, ArrowUpRight, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIInsights = () => {
  const [marketSummary, setMarketSummary] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          axios.get(`${API_URL}/ai/market-summary`),
          axios.get(`${API_URL}/stocks`)
        ]);
        if (mRes.data.success) setMarketSummary(mRes.data.data);
        if (sRes.data.success) setStocks(sRes.data.data.slice(0, 12));
      } catch (err) {
        console.error('AI Insights error:', err);
      } finally {
        setLoadingMarket(false);
        setLoadingStocks(false);
      }
    };
    fetchData();
  }, []);

  const analyzeStock = async (symbol) => {
    setAnalyzing(symbol);
    try {
      const res = await axios.get(`${API_URL}/ai/summary/${symbol}`);
      if (res.data.success) {
        setAnalyses(prev => ({ ...prev, [symbol]: res.data.data }));
      }
    } catch (err) {
      console.error('Error analyzing stock:', err);
    } finally {
      setAnalyzing(null);
    }
  };

  const moodColor = {
    Bullish: 'text-emerald-400',
    Bearish: 'text-red-400',
    Neutral: 'text-zinc-400'
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-400" /> AI Market Insights
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Powered by FastAPI sentiment & ML engine</p>
      </div>

      {/* Market Summary Banner */}
      {loadingMarket ? (
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs text-zinc-500">Fetching AI Market Analysis...</span>
        </div>
      ) : marketSummary && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 to-zinc-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Sparkles className="w-48 h-48 text-indigo-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">AI Market Summary</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500">Market Mood:</span>
                <span className={`text-[10px] font-bold uppercase ${moodColor[marketSummary.marketMood] || 'text-zinc-400'}`}>
                  {marketSummary.marketMood}
                </span>
                <span className="text-[10px] text-zinc-600">|</span>
                <span className="text-[10px] text-zinc-500">Sentiment Score:</span>
                <span className={`text-[10px] font-bold ${marketSummary.sentimentScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {marketSummary.sentimentScore >= 0 ? '+' : ''}{marketSummary.sentimentScore?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="ml-auto flex gap-4 text-center">
              <div>
                <span className="text-xl font-extrabold text-emerald-400">{marketSummary.advances}</span>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Advances</p>
              </div>
              <div>
                <span className="text-xl font-extrabold text-red-400">{marketSummary.declines}</span>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Declines</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{marketSummary.summary}</p>
        </div>
      )}

      {/* Per-Stock AI Analysis */}
      <div>
        <h3 className="font-bold text-sm text-zinc-200 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" /> Stock-Level AI Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stocks.map((stock) => {
            const analysis = analyses[stock.symbol];
            const isAnalyzing = analyzing === stock.symbol;
            return (
              <div key={stock.symbol} className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/stocks/${stock.symbol}`} className="font-bold text-zinc-100 hover:text-indigo-400 transition-colors text-sm">
                      {stock.symbol}
                    </Link>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                    </span>
                    <button
                      onClick={() => analyzeStock(stock.symbol)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 text-[10px] font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Brain className="w-3 h-3" />
                      )}
                      {isAnalyzing ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze'}
                    </button>
                  </div>
                </div>

                {analysis && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Recommendation</span>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${analysis.recommendation?.includes('BUY') ? 'bg-emerald-500/10 text-emerald-400' :
                          analysis.recommendation?.includes('SELL') ? 'bg-red-500/10 text-red-400' :
                            'bg-zinc-800 text-zinc-400'
                        }`}>
                        {analysis.recommendation}
                      </span>
                    </div>
                    {analysis.metrics && (
                      <div className="flex gap-3">
                        <div className="flex-1 bg-zinc-950/40 rounded-lg p-2 text-center">
                          <span className="text-xs font-bold text-zinc-200">{analysis.metrics.rsi?.toFixed(1)}</span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">RSI</p>
                        </div>
                        <div className="flex-1 bg-zinc-950/40 rounded-lg p-2 text-center">
                          <span className={`text-xs font-bold ${analysis.metrics.trend === 'Uptrend' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {analysis.metrics.trend}
                          </span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Trend</p>
                        </div>
                        <div className="flex-1 bg-zinc-950/40 rounded-lg p-2 text-center">
                          <span className={`text-xs font-bold ${analysis.metrics.avgSentiment >= 0.2 ? 'text-emerald-400' : analysis.metrics.avgSentiment <= -0.2 ? 'text-red-400' : 'text-zinc-400'}`}>
                            {analysis.metrics.avgSentiment >= 0.2 ? 'Bullish' : analysis.metrics.avgSentiment <= -0.2 ? 'Bearish' : 'Neutral'}
                          </span>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Sentiment</p>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{analysis.technicalSummary}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
