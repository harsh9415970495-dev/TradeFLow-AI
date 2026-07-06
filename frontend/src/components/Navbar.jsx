import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import SearchBar from './SearchBar';
import NotificationPanel from './NotificationPanel';
import { Wallet, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-16 sticky top-0 z-40 px-6 flex items-center justify-between"
      style={{
        background: 'rgba(11,14,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(68,75,89,0.35)',
        boxShadow: '0 1px 0 rgba(0,210,255,0.04)',
      }}
    >
      {/* Left: Search */}
      <SearchBar />

      {/* Right: Status + Balance + Notifications + Avatar */}
      <div className="flex items-center gap-3">

        {/* Live connection pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all"
          style={{
            background: isConnected ? 'rgba(0,242,155,0.08)' : 'rgba(255,180,171,0.08)',
            border: `1px solid ${isConnected ? 'rgba(0,242,155,0.25)' : 'rgba(255,180,171,0.25)'}`,
            color: isConnected ? '#00f29b' : '#ffb4ab',
          }}
        >
          {isConnected ? (
            <>
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Wifi className="w-3 h-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Virtual Balance badge */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
            style={{
              background: 'rgba(0,210,255,0.07)',
              border: '1px solid rgba(0,210,255,0.2)',
            }}
          >
            <Wallet className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] text-primary uppercase font-bold tracking-widest">Virtual Balance</span>
              <span className="text-xs font-bold text-on-surface mt-0.5">
                {user.cashBalance.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        <NotificationPanel />

        {/* User avatar */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-on-primary cursor-pointer hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #a582ff 100%)',
              boxShadow: '0 0 12px rgba(0,210,255,0.3)',
            }}
            title={user.username}
          >
            {user.username.charAt(0).toUpperCase()}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
