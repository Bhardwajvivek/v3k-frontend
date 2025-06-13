// App.jsx (FULL - Final Updated)
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import ChartModal from './components/ChartModal';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const App = () => {
  const [signals, setSignals] = useState([]);
  const [indices, setIndices] = useState([]);
  const [news, setNews] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [soundAlert, setSoundAlert] = useState(true);
  const [strategyFilters, setStrategyFilters] = useState({});
  const [typeFilters, setTypeFilters] = useState({});
  const [timeframeFilters, setTimeframeFilters] = useState({});
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [compactView, setCompactView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const prevSignalIds = useRef(new Set());

  const speakAlert = (text) => {
    if (!soundAlert) return;
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    if (hour >= 9 && (hour < 15 || (hour === 15 && minute <= 30))) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchSignals = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-signals`);
      const updatedSignals = (res.data.signals || []).map(signal => {
        const currentPrice = signal.price;
        const entry = signal.entryPrice || currentPrice;
        let sl = signal.stopLoss || (entry * 0.98);
        const rr = signal.riskRewardRatio || 2.0;
        const tp = entry + (entry - sl) * rr;

        if (signal.signalType === "Buy" || signal.signalType === "Strong Buy") {
          const risk = entry - sl;
          const buffer = risk * 1.5;
          if (currentPrice > entry + buffer) {
            sl = entry + (risk * 0.5);
          }
        } else {
          const risk = sl - entry;
          const buffer = risk * 1.5;
          if (currentPrice < entry - buffer) {
            sl = entry - (risk * 0.5);
          }
        }

        return {
          ...signal,
          stopLoss: parseFloat(sl.toFixed(2)),
          entryPrice: parseFloat(entry.toFixed(2)),
          exitPrice: parseFloat(tp.toFixed(2)),
          riskRewardRatio: rr
        };
      });

      const topSignals = [...updatedSignals].sort((a, b) => b.strength - a.strength).slice(0, 3);
      const newSignalIds = new Set(topSignals.map(s => `${s.symbol}_${s.timeframe}`));
      topSignals.forEach(s => {
        const id = `${s.symbol}_${s.timeframe}`;
        if (!prevSignalIds.current.has(id)) {
          speakAlert(`Top ${s.signalType} on ${s.symbol}`);
        }
      });
      prevSignalIds.current = newSignalIds;
      setSignals(updatedSignals.sort((a, b) => b.strength - a.strength).slice(0, 10));

      const tagSet = new Set();
      const typeSet = new Set();
      const tfSet = new Set();
      updatedSignals.forEach(s => {
        (s.strategyTags || []).forEach(tag => tagSet.add(tag));
        if (s.type) typeSet.add(s.type);
        if (s.timeframe) tfSet.add(s.timeframe);
      });

      setStrategyFilters(prev => {
        const updated = {};
        tagSet.forEach(tag => updated[tag] = prev?.[tag] || false);
        return updated;
      });

      setTypeFilters(prev => {
        const updated = {};
        typeSet.forEach(type => updated[type] = prev?.[type] || false);
        return updated;
      });

      setTimeframeFilters(prev => {
        const updated = {};
        tfSet.forEach(tf => updated[tf] = prev?.[tf] || false);
        return updated;
      });

    } catch (err) {
      console.error("Error fetching signals", err);
    }
  };

  const fetchIndices = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-live-indices`);
      setIndices(res.data || []);
    } catch (err) {
      console.error("Error fetching indices", err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-market-news`);
      setNews(res.data || []);
    } catch (err) {
      console.error("Error fetching news", err);
    }
  };

  useEffect(() => {
    fetchSignals();
    fetchIndices();
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused) {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (autoRefresh) {
              fetchSignals();
              fetchIndices();
              fetchNews();
            }
            return 60;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, paused]);

  const handleToggle = (setter, filters, key) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSignals = signals.filter(s => {
    const matchesTag = Object.values(strategyFilters).some(Boolean)
      ? (s.strategyTags || []).some(tag => strategyFilters[tag])
      : true;
    const matchesType = Object.values(typeFilters).some(Boolean)
      ? typeFilters[s.type]
      : true;
    const matchesTF = Object.values(timeframeFilters).some(Boolean)
      ? timeframeFilters[s.timeframe]
      : true;
    return matchesTag && matchesType && matchesTF;
  });

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen px-4 py-2 transition-colors`}>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>V3k - AI Trading Bot</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Turning signals into success</p>
        </div>
        <div className="text-sm mt-2 md:mt-0">
          ⏱ {countdown}s
          <button onClick={() => setPaused(!paused)} className="ml-2 px-2 py-1 rounded text-xs bg-gray-700 text-white hover:bg-gray-600">
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="ml-2 px-2 py-1 rounded text-xs bg-gray-700 text-white hover:bg-gray-600">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className={`text-sm p-2 mb-3 rounded ${darkMode ? 'bg-gray-900 text-blue-300' : 'bg-gray-200 text-blue-700'}`}>
        {indices.map((i, idx) => (
          <span key={idx} className="mx-2">
            {i.symbol} ₹{i.price} ({i.change}%) |
          </span>
        ))}
      </div>

      <div className="mb-4 text-xs flex flex-wrap gap-2">
        <button onClick={fetchSignals} className="bg-cyan-600 px-3 py-1 rounded text-white">🔄 Refresh</button>
        <label><input type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} /> Auto-refresh</label>
        <label><input type="checkbox" checked={soundAlert} onChange={() => setSoundAlert(!soundAlert)} /> 🔔 Sound</label>
        <label><input type="checkbox" checked={compactView} onChange={() => setCompactView(!compactView)} /> Compact</label>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {Object.keys(strategyFilters).map((tag, idx) => (
          <button key={idx} className={`px-2 py-1 rounded-full border ${strategyFilters[tag] ? 'bg-cyan-600 text-white' : 'bg-gray-600'}`} onClick={() => handleToggle(setStrategyFilters, strategyFilters, tag)}>#{tag}</button>
        ))}
        {Object.keys(typeFilters).map((type, idx) => (
          <button key={idx} className={`px-2 py-1 rounded-full border ${typeFilters[type] ? 'bg-yellow-600 text-white' : 'bg-gray-600'}`} onClick={() => handleToggle(setTypeFilters, typeFilters, type)}>{type}</button>
        ))}
        {Object.keys(timeframeFilters).map((tf, idx) => (
          <button key={idx} className={`px-2 py-1 rounded-full border ${timeframeFilters[tf] ? 'bg-pink-600 text-white' : 'bg-gray-600'}`} onClick={() => handleToggle(setTimeframeFilters, timeframeFilters, tf)}>{tf}</button>
        ))}
      </div>

      <div className={`grid ${compactView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-4'}`}>
        {filteredSignals.map((s, idx) => (
          <div key={idx} className={`p-4 rounded-xl shadow-md border cursor-pointer transition-all ${darkMode ? 'bg-gray-900 border-gray-700 hover:shadow-lg' : 'bg-white border-gray-300 hover:shadow-md'}`} onClick={() => setSelectedSignal(s)}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-yellow-400">{s.symbol}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${s.signalType === "Buy" ? "bg-green-600" : "bg-red-600"} text-white`}>{s.signalType}</span>
            </div>
            <p className="text-xs text-gray-400">Strategy: {s.strategy}</p>
            <p className="text-xs text-gray-500">Type: {s.type} | TF: {s.timeframe}</p>
            <p className="text-sm mt-1">Price: ₹{s.price}</p>
            <div className="mt-2 text-sm text-yellow-300">
              Entry: ₹{s.entryPrice} | Target: ₹{s.exitPrice} | SL: ₹{s.stopLoss} | R:R = {s.riskRewardRatio}
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Strength</span>
                <span>{s.strength ? `${s.strength}%` : '—'}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded">
                <div className="h-2 rounded bg-gradient-to-r from-green-400 to-blue-500" style={{ width: `${s.strength || 70}%` }}></div>
              </div>
            </div>
            {s.sparkline && (
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={50}>
                  <AreaChart data={s.sparkline.map((p, i) => ({ value: p, idx: i }))}>
                    <Area type="monotone" dataKey="value" stroke="#0ff" fill="#0ff" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">📰 Market News</h2>
        <ul className="space-y-1 list-disc pl-4 text-blue-400 text-sm">
          {news.map((n, idx) => (
            <li key={idx}>
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {n.title} – <span className="text-gray-400">{n.source}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ChartModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} darkMode={darkMode} />
    </div>
  );
};

export default App;
