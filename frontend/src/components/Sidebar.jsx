import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  History,
  Brain,
  User,
  LogOut,
  Zap,
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard',   path: '/',            icon: LayoutDashboard, end: true },
    { name: 'Markets',     path: '/markets',     icon: TrendingUp },
    { name: 'Portfolio',   path: '/portfolio',   icon: Briefcase },
    { name: 'Orders',      path: '/orders',      icon: History },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain },
    { name: 'Profile',     path: '/profile',     icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  };
  const linkVariants = {
    hidden:  { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <aside
      className="w-64 flex flex-col h-screen sticky top-0 z-30 border-r border-outline-variant/50"
      style={{ background: 'rgba(11,14,20,0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* ── Brand Header ── */}
      <div className="p-5 border-b border-outline-variant/40">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Animated glowing logo mark */}
          <div className="relative w-10 h-10 flex-shrink-0">
            {/* Animated ping ring */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.3)' }}
              animate={{ boxShadow: ['0 0 6px rgba(0,210,255,0.3)', '0 0 18px rgba(0,210,255,0.6)', '0 0 6px rgba(0,210,255,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#00d2ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l4-5 4 4 9-10" />
                <path d="M17 6h4v4" />
                <circle cx="3"  cy="17" r="1.5" fill="#00d2ff" />
                <circle cx="7"  cy="12" r="1.5" fill="#00d2ff" />
                <circle cx="11" cy="16" r="1.5" fill="#00d2ff" />
                <circle cx="20" cy="6"  r="1.5" fill="#00d2ff" />
              </svg>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="font-extrabold text-[13px] tracking-widest neon-text-primary leading-none">
              TRADEFLOW AI
            </h1>
            <span className="text-[9px] uppercase font-semibold tracking-widest text-on-surface-variant mt-0.5 block">
              Intelligent Trading
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Nav Links ── */}
      <motion.nav
        className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.path} variants={linkVariants}>
              <NavLink
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium relative overflow-hidden ${
                    isActive ? 'nav-active text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: 'rgba(68,75,89,0.25)' }}
                      />
                    )}
                    <Icon className={`w-4 h-4 relative z-10 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-on-surface'}`} />
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        layoutId="activeIndicator"
                        style={{ boxShadow: '0 0 6px #00d2ff' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* ── User Footer ── */}
      <motion.div
        className="p-3 border-t border-outline-variant/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        {user && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ background: 'rgba(30,34,43,0.6)', border: '1px solid rgba(68,75,89,0.3)' }}
          >
            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-on-primary"
                style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #a582ff 100%)' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">{user.username}</p>
              <p className="text-[9px] text-on-surface-variant truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </aside>
  );
};

export default Sidebar;
