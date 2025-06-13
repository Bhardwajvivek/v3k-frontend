import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Safe environment variable access
const getApiBaseUrl = () => {
  try {
    return import.meta?.env?.VITE_API_URL || "http://127.0.0.1:5000";
  } catch (error) {
    return process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
  }
};

const API_BASE_URL = getApiBaseUrl();

const SignalBoard = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "All",
    indicators: [],
    timeframe: [],
    minStrength: 0,
    sortBy: "none"
  });

  const fetchSignals = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get("/get-signals", {
        baseURL: API_BASE_URL,
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      });

      if (res.data && Array.isArray(res.data)) {
        const cleaned = res.data.filter(signal =>
          signal && typeof signal === 'object' && signal.symbol?.trim() && signal.strategy?.trim()
        );
        setSignals(cleaned);
        setLoading(false);
      } else {
        setError("Invalid signal format received from server");
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = "Failed to fetch signals";
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - server taking too long to respond";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "Network error - unable to reach server";
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const handleFilterChange = useCallback((category, value) => {
    setFilters(prev => {
      if (category === "type") return { ...prev, type: value };
      if (category === "indicators") {
        const updated = prev.indicators.includes(value)
          ? prev.indicators.filter(i => i !== value)
          : [...prev.indicators, value];
        return { ...prev, indicators: updated };
      }
      if (category === "timeframe") {
        const updated = prev.timeframe.includes(value)
          ? prev.timeframe.filter(i => i !== value)
          : [...prev.timeframe, value];
        return { ...prev, timeframe: updated };
      }
      if (category === "minStrength") return { ...prev, minStrength: Number(value) || 0 };
      if (category === "sortBy") return { ...prev, sortBy: value };
      return prev;
    });
  }, []);

  const filtered = React.useMemo(() => {
    let result = signals.filter(signal => {
      const matchType = filters.type === "All" || signal.type?.toLowerCase() === filters.type.toLowerCase();
      const matchInd = filters.indicators.length === 0 ||
        (signal.strategyTags && Array.isArray(signal.strategyTags) &&
         filters.indicators.some(ind =>
           signal.strategyTags.some(tag => tag?.toLowerCase().includes(ind.toLowerCase()))));
      const matchTF = filters.timeframe.length === 0 || filters.timeframe.includes(signal.timeframe?.toLowerCase());
      const matchStrength = !filters.minStrength || (signal.strength && Number(signal.strength) >= filters.minStrength);
      return matchType && matchInd && matchTF && matchStrength;
    });

    if (filters.sortBy === "strength") {
      result.sort((a, b) => (Number(b.strength) || 0) - (Number(a.strength) || 0));
    } else if (filters.sortBy === "symbol") {
      result.sort((a, b) => (a.symbol || '').localeCompare(b.symbol || ''));
    }

    return result;
  }, [signals, filters]);

  if (loading) {
    return (
      <div className="p-4 text-sm bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading signals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">📡 V3k - Live Signals</h2>
          <p className="italic text-gray-600 dark:text-gray-400">Powered by V3k AI Bot</p>
        </div>
        <button
          onClick={fetchSignals}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button onClick={fetchSignals} className="ml-4 underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Signal Type:</h3>
        <div className="flex flex-wrap gap-2">
          {['All', 'Intraday', 'Swing', 'Watchlist'].map(type => (
            <button
              key={type}
              onClick={() => handleFilterChange('type', type)}
              className={`px-3 py-1 rounded transition-colors ${filters.type === type ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Indicators:</h3>
        <div className="flex flex-wrap gap-2">
          {['MACD', 'RSI', 'Supertrend', 'Volume Spike', 'EMA Crossover'].map(ind => (
            <button
              key={ind}
              onClick={() => handleFilterChange('indicators', ind)}
              className={`px-2 py-1 rounded text-xs transition-colors ${filters.indicators.includes(ind) ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Timeframe:</h3>
        <div className="flex flex-wrap gap-2">
          {['5min', '15min', 'daily'].map(tf => (
            <button
              key={tf}
              onClick={() => handleFilterChange('timeframe', tf)}
              className={`px-2 py-1 rounded text-xs transition-colors ${filters.timeframe.includes(tf) ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Sort by:</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          className="px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
        >
          <option value="none">Default</option>
          <option value="strength">Strength (High to Low)</option>
          <option value="symbol">Symbol (A-Z)</option>
        </select>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filtered.length} of {signals.length} signals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="text-gray-500 col-span-full text-center py-8">
            {signals.length === 0 ? "No signals available" : "No signals match your filters"}
          </div>
        ) : (
          filtered.map((signal, index) => (
            <div
              key={`${signal.symbol}-${signal.strategy}-${index}`}
              className="p-4 border rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start font-bold text-lg mb-2">
                <span className="text-blue-600 dark:text-blue-400">{signal.symbol || 'N/A'}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  (signal.strength || 0) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  (signal.strength || 0) >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {signal.strength || 0}%
                </span>
              </div>

              <div className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium">
                {signal.strategy || 'No strategy'}
              </div>

              {signal.strategyTags && signal.strategyTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {signal.strategyTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-indigo-500 text-white px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                {signal.timeframe && <span>⏱️ {signal.timeframe}</span>}
                {signal.type && <span>📈 {signal.type}</span>}
                {signal.price && <span>💰 ₹{signal.price}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SignalBoard;
