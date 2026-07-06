import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AIChatWidget from '../components/AIChatWidget';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: '#0b0e14' }}>

      {/* ── Ambient Aurora Background Blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary cyan blob — top left */}
        <motion.div
          className="absolute w-[700px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,210,255,0.055) 0%, transparent 70%)',
            top: '-10%', left: '-8%',
          }}
          animate={{ x: [0, 20, 0], y: [0, 15, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Secondary purple blob — bottom right */}
        <motion.div
          className="absolute w-[600px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(165,130,255,0.05) 0%, transparent 70%)',
            bottom: '-10%', right: '-6%',
          }}
          animate={{ x: [0, -15, 0], y: [0, -12, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        {/* Tertiary green blob — center */}
        <motion.div
          className="absolute w-[400px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,242,155,0.03) 0%, transparent 70%)',
            top: '40%', left: '45%',
          }}
          animate={{ x: [0, 10, -10, 0], y: [0, -8, 8, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── AI Chat Widget ── */}
      <AIChatWidget />
    </div>
  );
};

export default DashboardLayout;
