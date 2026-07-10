import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Floating particle helper ── */
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: 3, height: 3, background: 'rgba(0,210,255,0.5)', ...style }}
    animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }}
    transition={{ duration: style.duration, repeat: Infinity, delay: style.delay, ease: 'easeInOut' }}
  />
);

/* ── Mini Ticker Row ── */
const TickerRow = ({ symbol, price, change, positive }) => (
  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg"
    style={{ background: 'rgba(30,34,43,0.7)', border: '1px solid rgba(68,75,89,0.4)' }}>
    <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">{symbol}</span>
    <span className="text-[10px] font-bold text-on-surface">₹{price}</span>
    <span className={`text-[9px] font-bold flex items-center gap-0.5 ${positive ? 'text-tertiary' : 'text-error'}`}>
      {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {change}
    </span>
  </div>
);

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) navigate('/');
  };

  // Simulated live tickers
  const [tickers, setTickers] = useState([
    { symbol: 'RELIANCE', price: '2,451.75', change: '+1.42%', positive: true },
    { symbol: 'TCS',      price: '3,892.20', change: '+0.78%', positive: true },
    { symbol: 'INFY',     price: '1,764.55', change: '-0.34%', positive: false },
    { symbol: 'HDFC',     price: '1,609.80', change: '+2.11%', positive: true },
    { symbol: 'WIPRO',    price: '482.30',   change: '-1.05%', positive: false },
  ]);

  const particles = Array.from({ length: 14 }, (_, i) => ({
    left:  `${Math.random() * 90 + 5}%`,
    top:   `${Math.random() * 80 + 10}%`,
    duration: 4 + Math.random() * 5,
    delay:    Math.random() * 4,
  }));

  const fieldVariants = {
    hidden:  { opacity: 0, y: 14 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 + 0.3, duration: 0.4, ease: 'easeOut' } }),
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden select-none"
      style={{ background: '#0b0e14', fontFamily: 'Geist, Inter, sans-serif' }}
    >
      {/* ── Aurora Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[800px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,210,255,0.07) 0%, transparent 65%)', top: '-15%', left: '-10%' }}
          animate={{ x: [0, 25, 0], y: [0, 18, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(165,130,255,0.06) 0%, transparent 65%)', bottom: '-10%', right: '-5%' }}
          animate={{ x: [0, -20, 0], y: [0, -14, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute w-[400px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,242,155,0.04) 0%, transparent 65%)', top: '50%', left: '40%' }}
          animate={{ x: [0, 12, -12, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ══════════════════════════════════════════
          LEFT PANE — Animated Bull + Terminal Demo
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-6 relative z-10 border-r"
        style={{ borderColor: 'rgba(68,75,89,0.4)' }}
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-9 h-9">
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)' }}
              animate={{ boxShadow: ['0 0 8px rgba(0,210,255,0.3)', '0 0 20px rgba(0,210,255,0.6)', '0 0 8px rgba(0,210,255,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="#00d2ff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 17l4-5 4 4 9-10" />
                <path d="M17 6h4v4" />
              </svg>
            </div>
          </div>
          <div>
            <p className="font-extrabold text-[12px] tracking-widest neon-text-primary">ATLAS AI Trading & Learning Analytics System</p>
            <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-semibold">Intelligent Trading Portal</p>
          </div>
        </motion.div>

        {/* HERO — Animated neon bull SVG */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Glow ring behind bull */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,210,255,0.12) 0%, transparent 70%)',
                width: '360px', height: '300px', left: '-20px', top: '-20px',
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <svg
              viewBox="0 0 220 170"
              className="w-[260px] h-[195px] drop-shadow-[0_0_18px_rgba(0,210,255,0.5)]"
              fill="none"
              stroke="#00d2ff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Horns */}
              <motion.path d="M140 48 C160 36, 182 42, 190 62 C178 62, 158 59, 143 55"
                strokeWidth="1.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
              <motion.path d="M114 52 C130 26, 160 18, 182 32 C165 40, 144 44, 132 48"
                strokeWidth="1.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
              {/* Head */}
              <motion.path d="M118 58 L142 80 L128 92 L108 72 Z"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />
              <motion.path d="M128 92 L118 104 L102 97 L108 72"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 1.0 }} />
              {/* Body */}
              <motion.path d="M108 58 C92 44, 72 47, 56 54 C66 68, 80 84, 84 105"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2 }} />
              <motion.path d="M56 54 C40 60, 24 72, 14 88 L28 124 L46 128 L56 98"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.4 }} />
              <motion.path d="M84 105 L96 142 L110 144 L120 98"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.6 }} />
              <motion.path d="M56 98 L66 146 L80 148 L84 105"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.7 }} />
              {/* Hind */}
              <motion.path d="M14 88 C9 104, 4 120, 12 138 L22 140 L28 124"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.8 }} />
              {/* Network nodes */}
              {[
                [120,70,'#00f29b'], [80,85,'#00d2ff'], [55,96,'#a582ff'],
                [96,120,'#00d2ff'], [28,108,'#00f29b'], [108,58,'#a582ff'],
              ].map(([cx,cy,fill],i) => (
                <motion.circle key={i} cx={cx} cy={cy} r="2.5" fill={fill} stroke="none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0.5,1,0.5] }}
                  transition={{ delay: 2 + i * 0.15, duration: 2, repeat: Infinity }}
                />
              ))}
              {/* Network lines */}
              <line x1="120" y1="70" x2="80" y2="85"   stroke="rgba(0,242,155,0.3)" strokeWidth="0.8" />
              <line x1="80"  y1="85" x2="55" y2="96"   stroke="rgba(0,210,255,0.3)" strokeWidth="0.8" />
              <line x1="55"  y1="96" x2="28" y2="108"  stroke="rgba(165,130,255,0.3)" strokeWidth="0.8" />
              <line x1="80"  y1="85" x2="96" y2="120"  stroke="rgba(0,210,255,0.3)" strokeWidth="0.8" />

              {/* Upward arrow — top right */}
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                <path d="M168 30 L195 8 M183 8 L195 8 L195 20" stroke="#00f29b" strokeWidth="2" strokeLinecap="round" />
              </motion.g>

              {/* Price chart line — bottom right */}
              <motion.path
                d="M148 145 L158 130 L168 138 L180 120 L192 108 L204 95"
                stroke="#00f29b" strokeWidth="1.5" strokeDasharray="80"
                initial={{ strokeDashoffset: 80 }} animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 2.8, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <h2 className="text-3xl font-extrabold text-on-surface leading-tight">
              Trade Smarter.<br />
              <span className="gradient-text-primary">Win Consistently.</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-3 max-w-xs mx-auto leading-relaxed">
              AI-powered virtual trading with ₹10,00,000 virtual capital. Master the markets before risking real money.
            </p>
          </motion.div>

          {/* Live market ticker strip */}
          <motion.div
            className="w-full max-w-sm space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-primary" />
              Live Market Pulse
            </p>
            {tickers.map((t, i) => <TickerRow key={i} {...t} />)}
          </motion.div>
        </div>

        {/* Footer stats bar */}
        <motion.div
          className="flex items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          {[['10L+', 'Virtual Capital'], ['50+', 'NSE Stocks'], ['Real-time', 'AI Signals']].map(([val, label], i) => (
            <div key={i} className="text-center">
              <p className="text-sm font-extrabold neon-text-primary">{val}</p>
              <p className="text-[8px] text-on-surface-variant uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANE — Glassmorphic Login Card
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.15 }}
          className="w-full max-w-md"
          style={{
            background: 'rgba(16,19,26,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(68,75,89,0.5)',
            borderRadius: '20px',
            padding: '36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,210,255,0.06)',
          }}
        >
          {/* Card header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-7"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-bold tracking-widest text-primary uppercase">ATLAS AI Trading & Learning Analytics System</span>
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Welcome back</h2>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Sign in to your AI trading portal and take control of your virtual portfolio.
            </p>
          </motion.div>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 px-3.5 py-2.5 rounded-xl text-xs text-error font-medium flex items-center gap-2"
                style={{ background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-on-surface placeholder-on-surface-variant/40 font-medium input-glow transition-all duration-200"
                  style={{
                    background: 'rgba(30,34,43,0.8)',
                    border: '1px solid rgba(68,75,89,0.5)',
                  }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Password
                </label>
                <span className="text-[10px] font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
                  Forgot password?
                </span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-on-surface placeholder-on-surface-variant/40 font-medium input-glow transition-all duration-200"
                  style={{
                    background: 'rgba(30,34,43,0.8)',
                    border: '1px solid rgba(68,75,89,0.5)',
                  }}
                />
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(0,210,255,0.45)' }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 mt-2 btn-shimmer disabled:opacity-60 cursor-pointer transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #00d2ff 0%, #0093b0 100%)',
                  color: '#003542',
                  boxShadow: '0 0 18px rgba(0,210,255,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Authenticating...
                  </>
                ) : (
                  <>
                    LOGIN TO PORTAL
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-1 border-t border-outline-variant/50" />
            <span className="mx-3 text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">or continue with</span>
            <div className="flex-1 border-t border-outline-variant/50" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.2.66 4.3 1.732l3.037-3.037C18.99 2.235 15.86 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.225 10.865-11.24 0-.568-.054-1.124-.162-1.65H12.24z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }, i) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-on-surface transition-all duration-200 cursor-pointer"
                style={{
                  background: 'rgba(30,34,43,0.7)',
                  border: '1px solid rgba(68,75,89,0.5)',
                }}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-[11px] text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:opacity-80 transition-opacity">
              Create Account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
