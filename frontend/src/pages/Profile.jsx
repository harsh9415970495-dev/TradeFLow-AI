import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import {
  User, Mail, DollarSign, Shield, LogOut, Briefcase, TrendingUp, TrendingDown, Activity
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = portfolio?.stats;

  return (
    <div className="space-y-8 fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Profile</h2>
          <p className="text-xs text-zinc-500 mt-1">Your account information and portfolio snapshot</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 hover:bg-red-950/60 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      {/* Avatar + Account Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        {/* Avatar Row */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-600/20">
            {user?.username?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-zinc-100">{user?.username || 'Trader'}</h3>
            <span className="text-xs text-zinc-500">Virtual Paper Trading Account</span>
          </div>
          <div className="ml-auto px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
            Active
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-zinc-800" />

        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-400" /> Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" /> Username
            </label>
            <div className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-medium">
              {user?.username || 'N/A'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <div className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-medium">
              {user?.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-zinc-400" /> Portfolio Snapshot
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Cash</span>
            </div>
            <span className="text-base font-extrabold text-zinc-100">
              ₹{stats?.availableCash?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
            </span>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Portfolio</span>
            </div>
            <span className="text-base font-extrabold text-zinc-100">
              ₹{stats?.totalPortfolioValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
            </span>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${(stats?.totalProfitLoss || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {(stats?.totalProfitLoss || 0) >= 0
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />
                }
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total P&L</span>
            </div>
            <span className={`text-base font-extrabold ${(stats?.totalProfitLoss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(stats?.totalProfitLoss || 0) >= 0 ? '+' : ''}₹{stats?.totalProfitLoss?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
            </span>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Holdings</span>
            </div>
            <span className="text-base font-extrabold text-zinc-100">
              {portfolio?.holdings?.length || 0} <span className="text-xs font-normal text-zinc-500">positions</span>
            </span>
          </div>
        </div>
      </div>

      {/* Account Type Badge */}
      <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Account Type</span>
          <span className="text-sm font-bold text-zinc-200 mt-0.5 block">Virtual Paper Trading</span>
          <span className="text-[10px] text-zinc-500">All trades are simulated. No real money involved.</span>
        </div>
        <div className="ml-auto text-right">
          <span className="text-[10px] text-zinc-500 block">Starting Balance</span>
          <span className="text-sm font-bold text-indigo-400">₹10,00,000</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
