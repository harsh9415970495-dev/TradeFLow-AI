import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign,
  BarChart2, ArrowUpRight, Layers
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Portfolio = () => {
  const { portfolio, loading, refreshPortfolio } = usePortfolio();

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs text-zinc-500">Loading Portfolio...</span>
      </div>
    );
  }

  const { holdings, stats } = portfolio;

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">My Portfolio</h2>
          <p className="text-xs text-zinc-500 mt-1">Live valuation of your virtual holdings</p>
        </div>
        <button onClick={refreshPortfolio} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: `₹${stats.totalPortfolioValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}`, icon: Briefcase, color: 'indigo' },
          { label: 'Available Cash', value: `₹${stats.availableCash?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}`, icon: DollarSign, color: 'emerald' },
          { label: 'Total P&L', value: `₹${stats.totalProfitLoss?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}`, icon: stats.totalProfitLoss >= 0 ? TrendingUp : TrendingDown, color: stats.totalProfitLoss >= 0 ? 'emerald' : 'red', isPN: true, pnl: stats.totalProfitLoss },
          { label: 'Holdings Value', value: `₹${stats.totalCurrentHoldingsValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}`, icon: Layers, color: 'purple' },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5 rounded-2xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{card.label}</span>
              <div className={`p-2 bg-${card.color}-500/10 text-${card.color}-400 rounded-xl`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <h3 className={`text-xl font-extrabold mt-3 ${card.isPN ? (card.pnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-100'}`}>
              {card.value}
            </h3>
            {card.isPN && stats.performancePercent !== undefined && (
              <span className={`text-[10px] font-semibold mt-1 block ${stats.performancePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.performancePercent >= 0 ? '+' : ''}{stats.performancePercent}% all time
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-zinc-400" />
          <h3 className="font-bold text-sm text-zinc-200">Holdings</h3>
          <span className="ml-auto text-[10px] text-zinc-500">{holdings.length} positions</span>
        </div>
        <div className="overflow-x-auto">
          {holdings.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <Briefcase className="w-10 h-10 text-zinc-700" />
              <p className="text-sm">No holdings yet.</p>
              <Link to="/markets" className="text-xs text-indigo-400 hover:underline font-semibold">Browse Markets →</Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Avg Buy</th>
                  <th className="px-6 py-4 text-right">Current</th>
                  <th className="px-6 py-4 text-right">Invested</th>
                  <th className="px-6 py-4 text-right">Current Val</th>
                  <th className="px-6 py-4 text-right">P&L</th>
                  <th className="px-6 py-4 text-right">P&L %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {holdings.map((h) => (
                  <tr key={h.symbol} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/stocks/${h.symbol}`} className="font-bold text-zinc-200 hover:text-indigo-400 transition-colors">
                        {h.symbol}
                      </Link>
                      <span className="block text-[10px] text-zinc-500 mt-0.5 truncate max-w-[140px]">{h.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-200">{h.quantity}</td>
                    <td className="px-6 py-4 text-right text-zinc-400">₹{h.averageBuyPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-200">₹{h.currentPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-zinc-400">₹{h.investmentValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-200">₹{h.currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className={`px-6 py-4 text-right font-bold ${h.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.totalProfitLoss >= 0 ? '+' : ''}₹{h.totalProfitLoss?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${h.totalProfitLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.totalProfitLossPercent >= 0 ? '+' : ''}{h.totalProfitLossPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
