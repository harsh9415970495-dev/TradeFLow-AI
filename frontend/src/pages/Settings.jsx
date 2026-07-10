import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Bell, Shield, Monitor, Palette, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    notifications: true,
    soundAlerts: false,
    liveUpdates: true,
    chartType: 'candlestick',
    currency: 'INR',
    defaultQty: '10',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ value, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-indigo-600' : 'bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-8 fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-zinc-400" /> Settings
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Customize your ATLAS AI Trading & Learning Analytics System experience</p>
      </div>

      {/* Appearance */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-zinc-400" /> Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Theme</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Choose your interface color theme</p>
            </div>
            <div className="flex gap-2">
              {['dark', 'darker'].map(t => (
                <button
                  key={t}
                  onClick={() => setPrefs(p => ({ ...p, theme: t }))}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${prefs.theme === t ? 'bg-indigo-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {t === 'dark' ? 'Dark' : 'Midnight'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Default Chart Type</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Preferred chart on Stock Details</p>
            </div>
            <div className="flex gap-2">
              {['candlestick', 'line', 'area'].map(t => (
                <button
                  key={t}
                  onClick={() => setPrefs(p => ({ ...p, chartType: t }))}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${prefs.chartType === t ? 'bg-indigo-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-400" /> Notifications
        </h3>
        <div className="space-y-5">
          {[
            { key: 'notifications', label: 'Push Notifications', desc: 'Receive in-app notifications for orders and alerts' },
            { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play audio cue when price alerts trigger' },
            { key: 'liveUpdates', label: 'Live Price Updates', desc: 'Receive real-time WebSocket price ticks' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-200">{item.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={prefs[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Trading Defaults */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-zinc-400" /> Trading Defaults
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Default Order Quantity</label>
            <input
              type="number"
              min="1"
              value={prefs.defaultQty}
              onChange={(e) => setPrefs(p => ({ ...p, defaultQty: e.target.value }))}
              className="w-full px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-200 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Display Currency</label>
            <select
              value={prefs.currency}
              onChange={(e) => setPrefs(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-200 transition-all"
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-400" /> Security
        </h3>
        <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-start gap-3">
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-zinc-200">JWT Authentication Active</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Your session is secured with a JSON Web Token. Tokens expire automatically for your protection. 
              Log out and back in to refresh your session.
            </p>
          </div>
        </div>
        <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-start gap-3">
          <Monitor className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-zinc-200">Paper Trading Mode</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              All trades are simulated with virtual currency. No real money is involved.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all shadow-lg ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Preferences Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
