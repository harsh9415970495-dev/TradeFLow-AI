import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, CheckCircle2, Zap, Shield, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { register, error, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    const success = await register(username, email, password);
    if (success) navigate('/');
  };

  const features = [
    { icon: Brain,        label: 'AI-Powered Signals',    desc: 'Real-time technical analysis & predictions' },
    { icon: Shield,       label: '₹10L Virtual Capital',  desc: 'Practice risk-free with simulated funds' },
    { icon: CheckCircle2, label: 'Live Market Data',       desc: 'NSE stocks with real-time WebSocket updates' },
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    left:  `${10 + Math.random() * 80}%`,
    top:   `${10 + Math.random() * 80}%`,
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
          className="absolute w-[700px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(165,130,255,0.07) 0%, transparent 65%)', top: '-15%', left: '-8%' }}
          animate={{ x: [0, 20, 0], y: [0, 16, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,210,255,0.06) 0%, transparent 65%)', bottom: '-12%', right: '-6%' }}
          animate={{ x: [0, -18, 0], y: [0, -12, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        <motion.div
          className="absolute w-[400px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,242,155,0.04) 0%, transparent 65%)', top: '45%', left: '35%' }}
          animate={{ x: [0, 14, -14, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
        />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: 3, height: 3, background: 'rgba(165,130,255,0.5)', left: p.left, top: p.top }}
            animate={{ y: [0, -38, 0], opacity: [0, 0.7, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════
          LEFT PANE — Features showcase
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-10 relative z-10 border-r"
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
              style={{ background: 'rgba(165,130,255,0.1)', border: '1px solid rgba(165,130,255,0.35)' }}
              animate={{ boxShadow: ['0 0 8px rgba(165,130,255,0.3)', '0 0 20px rgba(165,130,255,0.6)', '0 0 8px rgba(165,130,255,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div>
            <p className="font-extrabold text-[12px] tracking-widest neon-text-secondary">TRADEFLOW AI</p>
            <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-semibold">Join the Trading Revolution</p>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-center gap-10">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold text-on-surface leading-tight">
              Start Trading<br />
              <span style={{
                background: 'linear-gradient(135deg, #a582ff 0%, #00d2ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                With AI Precision.
              </span>
            </h2>
            <p className="text-sm text-on-surface-variant mt-4 leading-relaxed max-w-sm">
              Create your free account and access a complete AI-powered virtual trading platform.
              No real money required.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5, ease: 'easeOut' }}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(30,34,43,0.6)',
                  border: '1px solid rgba(68,75,89,0.4)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(165,130,255,0.12)', border: '1px solid rgba(165,130,255,0.25)' }}
                >
                  <Icon className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{label}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            className="flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            {[['50+', 'NSE Stocks'], ['Real-time', 'AI Signals'], ['Free', 'Forever']].map(([val, label]) => (
              <div key={label}>
                <p className="text-lg font-extrabold neon-text-secondary">{val}</p>
                <p className="text-[8px] uppercase tracking-wider text-on-surface-variant">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom trust line */}
        <motion.p
          className="text-[10px] text-on-surface-variant"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          🔒 Your data is encrypted and secure. We never share your information.
        </motion.p>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANE — Glassmorphic Register Card
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.15 }}
          className="w-full max-w-md"
          style={{
            background: 'rgba(16,19,26,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(68,75,89,0.5)',
            borderRadius: '20px',
            padding: '36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(165,130,255,0.06)',
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
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-[9px] font-bold tracking-widest text-secondary uppercase">TradeFlow AI</span>
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Create Account</h2>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Join thousands of traders using AI-powered insights to master the markets.
            </p>
          </motion.div>

          {/* Error */}
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
            {/* Username */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block mb-1.5">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-secondary transition-colors duration-200" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pick a username"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-on-surface placeholder-on-surface-variant/40 font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(30,34,43,0.8)',
                    border: '1px solid rgba(68,75,89,0.5)',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(165,130,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(165,130,255,0.1)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(68,75,89,0.5)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-secondary transition-colors duration-200" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-on-surface placeholder-on-surface-variant/40 font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(30,34,43,0.8)',
                    border: '1px solid rgba(68,75,89,0.5)',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(165,130,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(165,130,255,0.1)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(68,75,89,0.5)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-secondary transition-colors duration-200" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-on-surface placeholder-on-surface-variant/40 font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(30,34,43,0.8)',
                    border: '1px solid rgba(68,75,89,0.5)',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(165,130,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(165,130,255,0.1)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(68,75,89,0.5)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(165,130,255,0.45)' }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 mt-2 btn-shimmer disabled:opacity-60 cursor-pointer transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #a582ff 0%, #6e42c9 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 18px rgba(165,130,255,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    CREATE MY ACCOUNT
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-1 border-t border-outline-variant/50" />
            <span className="mx-3 text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">or sign up with</span>
            <div className="flex-1 border-t border-outline-variant/50" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.2.66 4.3 1.732l3.037-3.037C18.99 2.235 15.86 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.225 10.865-11.24 0-.568-.054-1.124-.162-1.65H12.24z"/></svg> },
            ].map(({ label, icon }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-on-surface transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(30,34,43,0.7)', border: '1px solid rgba(68,75,89,0.5)' }}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-secondary hover:opacity-80 transition-opacity">
              Sign In →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
