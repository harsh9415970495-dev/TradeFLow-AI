import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, X, ShieldAlert, Award, BrainCircuit, Newspaper } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Listen to live socket notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notif) => {
      // Prepend the new notification to state
      setNotifications((prev) => [
        {
          _id: Math.random().toString(), // temp id if not returned from server
          title: notif.title,
          message: notif.message,
          type: notif.type || 'ALERT',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, isConnected]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_EXECUTION':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'INSIGHT':
        return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
      case 'NEWS':
        return <Newspaper className="w-4 h-4 text-sky-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-zinc-950">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-zinc-200">Notifications</h3>
            <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400 font-medium">
              {unreadCount} Unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 flex gap-3 transition-colors ${
                    notif.read ? 'bg-zinc-900/40 opacity-75' : 'bg-zinc-950/20'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-semibold text-zinc-200 truncate">{notif.title}</h4>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif._id)}
                          className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-colors"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-zinc-600 mt-1 block">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
