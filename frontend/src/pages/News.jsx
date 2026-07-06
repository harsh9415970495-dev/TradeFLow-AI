import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const sentimentConfig = {
  POSITIVE: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Positive' },
  NEGATIVE: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Negative' },
  NEUTRAL: { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-800', label: 'Neutral' },
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_URL}/stocks/news`);
        if (res.data.success) setNews(res.data.data);
      } catch (err) {
        console.error('Error fetching news:', err);
        // Fallback mock news if API doesn't exist yet
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = filter === 'ALL' ? news : news.filter(n => n.sentiment === filter);

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-xs text-zinc-500">Loading Market News...</span>
    </div>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-indigo-400" /> Market News
          </h2>
          <p className="text-xs text-zinc-500 mt-1">AI-sentiment tagged financial news feed</p>
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                filter === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
          <Newspaper className="w-12 h-12 text-zinc-700" />
          <p className="text-sm font-medium">No news articles found</p>
          <p className="text-xs text-zinc-600">Seed the database to load news articles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article) => {
            const sc = sentimentConfig[article.sentiment] || sentimentConfig.NEUTRAL;
            const SentIcon = sc.icon;
            return (
              <div key={article._id} className="glass-card p-5 rounded-2xl flex flex-col gap-3 hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex-shrink-0 ${sc.bg} ${sc.color}`}>
                    <SentIcon className="w-3 h-3" />
                    {sc.label}
                  </div>
                  {article.source && (
                    <span className="text-[10px] text-zinc-600 truncate">{article.source}</span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2">
                  {article.title}
                </h4>

                {article.summary && (
                  <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">{article.summary}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.publishedAt || article.createdAt)}
                  </div>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      Read More <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default News;
