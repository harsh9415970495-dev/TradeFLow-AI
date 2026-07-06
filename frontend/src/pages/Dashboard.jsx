import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  ArrowUpRight,
  Activity,
  Zap,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Animated count-up number ── */
const AnimatedValue = ({ value, prefix = '₹', delay = 0 }) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
  >
    {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}
  </motion.span>
);

/* ── Single Stat Card ── */
const StatCard = ({ label, value, badge, icon: Icon, iconColor, iconBg, trend, trendLabel, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="glass-card p-5 rounded-2xl cursor-default group relative overflow-hidden"
  >
    {/* Subtle hover glow */}
    <motion.div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at top right, ${iconBg.replace('0.12', '0.06')}, transparent 60%)` }}
    />

    <div className="flex justify-between items-start mb-4">
      <span className="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant">{label}</span>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconBg.replace('0.12', '0.3')}` }}
      >
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
    </div>

    <div className="space-y-1.5">
      <h3 className="text-xl font-extrabold text-on-surface tracking-tight">
        <AnimatedValue value={value} delay={delay + 0.1} />
      </h3>
      {trend !== undefined && (
        <span className={`text-[10px] font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-tertiary' : 'text-error'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? '+' : ''}{trend}% {trendLabel}
        </span>
      )}
      {badge && <span className="text-[10px] text-on-surface-variant">{badge}</span>}
    </div>
  </motion.div>
);

/* ── Stock Row ── */
const StockRow = ({ stock, positive, index }) => (
  <motion.div
    initial={{ opacity: 0, x: positive ? -12 : 12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.05 * index, duration: 0.35, ease: 'easeOut' }}
    whileHover={{ x: positive ? 3 : -3, transition: { duration: 0.15 } }}
    className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group"
    style={{
      background: 'rgba(30,34,43,0.4)',
      border: '1px solid rgba(68,75,89,0.25)',
    }}
  >
    {/* Symbol + sector */}
    <div>
      <Link
        to={`/stocks/${stock.symbol}`}
        className={`font-bold text-xs text-on-surface group-hover:${positive ? 'text-tertiary' : 'text-error'} transition-colors`}
      >
        {stock.symbol}
      </Link>
      <span className="text-[9px] text-on-surface-variant block mt-0.5">{stock.sector}</span>
    </div>

    {/* Price + change */}
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-on-surface">₹{stock.price.toFixed(2)}</span>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5"
        style={{
          background: positive ? 'rgba(0,242,155,0.1)' : 'rgba(255,180,171,0.1)',
          color: positive ? '#00f29b' : '#ffb4ab',
          border: `1px solid ${positive ? 'rgba(0,242,155,0.2)' : 'rgba(255,180,171,0.2)'}`,
        }}
      >
        {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {positive ? '+' : ''}{stock.changePercent}%
      </span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { portfolio, loading } = usePortfolio();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [gainers, setGainers]           = useState([]);
  const [losers, setLosers]             = useState([]);
  const [aiSummary, setAiSummary]       = useState(null);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const fetchExtras = async () => {
    try {
      const [glRes, aiRes] = await Promise.all([
        axios.get(`${API_URL}/stocks/gainers-losers`),
        axios.get(`${API_URL}/ai/market-summary`),
      ]);
      if (glRes.data.success) {
        setGainers(glRes.data.gainers);
        setLosers(glRes.data.losers);
      }
      if (aiRes.data.success) setAiSummary(aiRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard extras:', err);
    } finally {
      setLoadingExtras(false);
    }
  };

  useEffect(() => { fetchExtras(); }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handlePriceTick = (tick) => {
      const updateList = (list) =>
        list.map((item) =>
          item.symbol === tick.symbol
            ? { ...item, price: tick.price, change: tick.change, changePercent: tick.changePercent }
            : item
        );
      setGainers((prev) => updateList(prev));
      setLosers((prev) => updateList(prev));
    };
    socket.on('stockPriceUpdate', handlePriceTick);
    return () => socket.off('stockPriceUpdate', handlePriceTick);
  }, [socket, isConnected]);

  /* ── Loading Skeleton ── */
  if (loading || loadingExtras) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 border-2 rounded-full flex-shrink-0"
          style={{ borderColor: 'rgba(0,210,255,0.2)', borderTopColor: '#00d2ff' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="text-[11px] text-on-surface-variant font-medium tracking-wider uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading TradeFlow Dashboard...
        </motion.p>
      </div>
    );
  }

  const stats = portfolio.stats;

  /* ── Time-of-day greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
            {greeting}, <span className="neon-text-primary">{user?.username}</span> 👋
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Here's your portfolio overview and today's market pulse.
          </p>
        </div>

        {/* Market status pill */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-xl self-start sm:self-auto"
          style={{
            background: 'rgba(0,242,155,0.07)',
            border: '1px solid rgba(0,242,155,0.2)',
          }}
          animate={{ boxShadow: ['0 0 0 rgba(0,242,155,0)', '0 0 12px rgba(0,242,155,0.2)', '0 0 0 rgba(0,242,155,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-tertiary flex-shrink-0"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <BarChart2 className="w-3.5 h-3.5 text-tertiary" />
          <span className="text-[11px] font-bold text-tertiary tracking-wide uppercase">Markets Open</span>
        </motion.div>
      </motion.div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Portfolio Value"
          value={stats.totalPortfolioValue}
          icon={Briefcase}
          iconColor="text-primary"
          iconBg="rgba(0,210,255,0.12)"
          trend={stats.performancePercent}
          trendLabel="All Time"
          delay={0.05}
        />
        <StatCard
          label="Available Cash"
          value={stats.availableCash}
          icon={DollarSign}
          iconColor="text-tertiary"
          iconBg="rgba(0,242,155,0.12)"
          badge="Margin balance available"
          delay={0.12}
        />
        <StatCard
          label="Today's P&L"
          value={Math.abs(stats.todayProfitLoss)}
          prefix={stats.todayProfitLoss >= 0 ? '₹+' : '₹-'}
          icon={Activity}
          iconColor="text-secondary"
          iconBg="rgba(165,130,255,0.12)"
          badge="Based on holding fluctuations"
          delay={0.18}
        />
        <StatCard
          label="Holdings Value"
          value={stats.totalCurrentHoldingsValue}
          icon={Layers}
          iconColor="text-primary"
          iconBg="rgba(0,210,255,0.08)"
          badge="Valuation of virtual assets"
          delay={0.24}
        />
      </div>

      {/* ── AI Market Summary ── */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'rgba(16,19,26,0.8)',
            border: '1px solid rgba(0,210,255,0.15)',
            boxShadow: '0 0 30px rgba(0,210,255,0.05)',
          }}
        >
          {/* Glow stripe top */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,255,0.5) 30%, rgba(165,130,255,0.5) 70%, transparent 100%)' }}
          />
          {/* Background icon */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.04] pointer-events-none">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.25)' }}
                  animate={{ boxShadow: ['0 0 6px rgba(0,210,255,0.2)', '0 0 14px rgba(0,210,255,0.4)', '0 0 6px rgba(0,210,255,0.2)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </motion.div>
                <span className="text-sm font-bold text-on-surface">AI Market Summary</span>
              </div>

              <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                <span className="text-[10px] text-on-surface-variant">Market Mood Index:</span>
                <span
                  className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg"
                  style={{
                    background: aiSummary.marketMood === 'Bullish'
                      ? 'rgba(0,242,155,0.1)' : aiSummary.marketMood === 'Bearish'
                      ? 'rgba(255,180,171,0.1)' : 'rgba(68,75,89,0.4)',
                    color: aiSummary.marketMood === 'Bullish'
                      ? '#00f29b' : aiSummary.marketMood === 'Bearish'
                      ? '#ffb4ab' : '#a1a7b3',
                    border: `1px solid ${aiSummary.marketMood === 'Bullish'
                      ? 'rgba(0,242,155,0.2)' : aiSummary.marketMood === 'Bearish'
                      ? 'rgba(255,180,171,0.2)' : 'rgba(68,75,89,0.5)'}`,
                  }}
                >
                  {aiSummary.marketMood}
                  {' '}(Score: {aiSummary.sentimentScore >= 0 ? '+' : ''}{aiSummary.sentimentScore.toFixed(2)})
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed max-w-4xl">
              {aiSummary.summary}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Top Movers ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gainers */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(16,19,26,0.7)',
            border: '1px solid rgba(68,75,89,0.35)',
          }}
        >
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(68,75,89,0.3)' }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tertiary" />
              <span className="font-bold text-sm text-on-surface">Top Gainers</span>
            </div>
            <Link to="/markets" className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:opacity-80">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {gainers.slice(0, 4).map((stock, i) => (
              <StockRow key={stock.symbol} stock={stock} positive={true} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Losers */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(16,19,26,0.7)',
            border: '1px solid rgba(68,75,89,0.35)',
          }}
        >
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(68,75,89,0.3)' }}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-error" />
              <span className="font-bold text-sm text-on-surface">Top Losers</span>
            </div>
            <Link to="/markets" className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:opacity-80">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {losers.slice(0, 4).map((stock, i) => (
              <StockRow key={stock.symbol} stock={stock} positive={false} index={i} />
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Dashboard;
