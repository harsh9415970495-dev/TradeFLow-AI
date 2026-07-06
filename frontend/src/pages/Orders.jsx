import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { History, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusConfig = {
  EXECUTED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Executed' },
  PENDING:  { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10',  label: 'Pending'  },
  CANCELLED:{ icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',     label: 'Cancelled' },
  COMPLETED:{ icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Executed' }, // legacy fallback
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      const res = await axios.delete(`${API_URL}/orders/cancel/${orderId}`);
      if (res.data.success) {
        // Optimistically update the order status locally
        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status: 'CANCELLED' } : o)
        );
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const filterTabs = ['ALL', 'EXECUTED', 'PENDING', 'CANCELLED'];
  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter || (filter === 'EXECUTED' && o.status === 'COMPLETED'));

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-xs text-zinc-500">Loading Orders...</span>
    </div>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Order History</h2>
          <p className="text-xs text-zinc-500 mt-1">All your buy &amp; sell orders</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {filterTabs.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  filter === s
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <h3 className="font-bold text-sm text-zinc-200">Orders</h3>
          <span className="ml-auto text-[10px] text-zinc-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <History className="w-10 h-10 text-zinc-700" />
              <p className="text-sm">No orders found.</p>
              <Link to="/markets" className="text-xs text-indigo-400 hover:underline font-semibold">Start Trading →</Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = sc.icon;
                  const isPending = order.status === 'PENDING';
                  const displayPrice = order.executedPrice || order.limitPrice || order.price || 0;
                  const displayTotal = order.totalAmount || (displayPrice * order.quantity) || 0;
                  return (
                    <tr key={order._id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/stocks/${order.symbol}`} className="font-bold text-zinc-200 hover:text-indigo-400 transition-colors">
                          {order.symbol}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          order.type === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{order.orderType || 'MARKET'}</td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200">{order.quantity}</td>
                      <td className="px-6 py-4 text-right text-zinc-200">
                        {displayPrice > 0 ? `₹${displayPrice.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-200">
                        {displayTotal > 0 ? `₹${displayTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${sc.bg} ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{formatDate(order.createdAt || order.timestamp)}</td>
                      <td className="px-6 py-4 text-center">
                        {isPending ? (
                          <button
                            onClick={() => handleCancel(order._id)}
                            disabled={cancellingId === order._id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/60 text-[10px] font-semibold transition-all disabled:opacity-50"
                          >
                            {cancellingId === order._id
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />}
                            {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span className="text-zinc-700 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
