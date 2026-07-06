import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/stocks?search=${query}`);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Error searching stocks:', err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol) => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    navigate(`/stocks/${symbol}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search stocks (e.g. RELIANCE, TCS, Energy...)"
          className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 text-zinc-200 placeholder-zinc-500 transition-colors"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto divide-y divide-zinc-800/40">
            {results.map((stock) => (
              <li key={stock.symbol}>
                <button
                  onClick={() => handleSelect(stock.symbol)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/60 transition-colors text-left"
                >
                  <div>
                    <span className="font-semibold text-sm text-zinc-200">{stock.symbol}</span>
                    <span className="ml-3 text-xs text-zinc-500 truncate max-w-[200px] inline-block align-bottom">
                      {stock.name}
                    </span>
                  </div>
                  <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                    {stock.sector}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
