// App.jsx  –  2025-06-16 final
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import ChartModal from "./components/ChartModal";

/* ---------- 1. Resolve backend base URL ---------- */
const getApiBaseUrl = () => {
  // ⬇️ honour .env first (works locally & on Vercel if you set the var)
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // ⬇️ production fallback for your domain
  if (window.location.hostname.includes("v3kbot"))
    return "https://v3k-backend-api.onrender.com";

  // ⬇️ default local dev
  return "http://127.0.0.1:5000";
};
const API_URL = getApiBaseUrl();

/* ---------- 2. Main Component ---------- */
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

  /* ---------- 3. Helpers ---------- */
  const speakAlert = (text) => {
    if (!soundAlert) return;
    const now = new Date();
    const [h, m] = [now.getHours(), now.getMinutes()];
    if (h >= 9 && (h < 15 || (h === 15 && m <= 30))) {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  /* ---------- 4. Fetchers ---------- */
  const fetchSignals = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-signals`);
      const raw = res.data?.signals || [];
      const enriched = raw.map((s) => {
        // dynamic SL / TP calc
        const entry = s.entryPrice || s.price;
        let sl = s.stopLoss ?? entry * 0.98;
        const rr = s.riskRewardRatio ?? 2.0;
        const tp = entry + (entry - sl) * rr;

        if (["Buy", "Strong Buy"].includes(s.signalType)) {
          const risk = entry - sl;
          if (s.price > entry + risk * 1.5) sl = entry + risk * 0.5;
        } else {
          const risk = sl - entry;
          if (s.price < entry - risk * 1.5) sl = entry - risk * 0.5;
        }

        return {
          ...s,
          entryPrice: +entry.toFixed(2),
          stopLoss: +sl.toFixed(2),
          exitPrice: +tp.toFixed(2),
          riskRewardRatio: rr,
        };
      });

      // 🔔 voice alert on NEW top 3
      const top3 = [...enriched]
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3);
      const newIds = new Set(top3.map((s) => `${s.symbol}_${s.timeframe}`));
      top3.forEach((s) => {
        const id = `${s.symbol}_${s.timeframe}`;
        if (!prevSignalIds.current.has(id))
          speakAlert(`Top ${s.signalType} on ${s.symbol}`);
      });
      prevSignalIds.current = newIds;

      // sort & trim list for UI
      setSignals(
        enriched.sort((a, b) => b.strength - a.strength).slice(0, 10)
      );

      // build dynamic filter lists
      const tagSet = new Set(),
        typeSet = new Set(),
        tfSet = new Set();
      enriched.forEach((s) => {
        (s.strategyTags || []).forEach((t) => tagSet.add(t));
        if (s.type) typeSet.add(s.type);
        if (s.timeframe) tfSet.add(s.timeframe);
      });

      setStrategyFilters((p) =>
        Object.fromEntries([...tagSet].map((t) => [t, p?.[t] || false]))
      );
      setTypeFilters((p) =>
        Object.fromEntries([...typeSet].map((t) => [t, p?.[t] || false]))
      );
      setTimeframeFilters((p) =>
        Object.fromEntries([...tfSet].map((t) => [t, p?.[t] || false]))
      );
    } catch (err) {
      console.error("❌ Error fetching signals", err);
    }
  };

  const fetchIndices = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-live-indices`);
      setIndices(res.data || []);
    } catch (e) {
      console.error("❌ Error fetching indices", e);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-market-news`);
      setNews(res.data || []);
    } catch (e) {
      console.error("❌ Error fetching news", e);
    }
  };

  /* ---------- 5. First load ---------- */
  useEffect(() => {
    fetchSignals();
    fetchIndices();
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 6. Auto-refresh ---------- */
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused) {
        setCountdown((c) => {
          if (c <= 1) {
            if (autoRefresh) {
              fetchSignals();
              fetchIndices();
              fetchNews();
            }
            return 60;
          }
          return c - 1;
        });
      }
    }, 1_000);
    return () => clearInterval(id);
  }, [autoRefresh, paused]); // deps

  /* ---------- 7. Filtering ---------- */
  const toggle = (setter, key) =>
    setter((p) => ({ ...p, [key]: !p[key] }));

  const filteredSignals = signals.filter((s) => {
    const tagOK =
      Object.values(strategyFilters).some(Boolean)
        ? (s.strategyTags || []).some((t) => strategyFilters[t])
        : true;
    const typeOK = Object.values(typeFilters).some(Boolean)
      ? typeFilters[s.type]
      : true;
    const tfOK = Object.values(timeframeFilters).some(Boolean)
      ? timeframeFilters[s.timeframe]
      : true;
    return tagOK && typeOK && tfOK;
  });

  /* ---------- 8. Render ---------- */
  return (
    <div
      className={`${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } min-h-screen px-4 py-2 transition-colors`}
    >
      {/* header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div className="text-center">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-cyan-400" : "text-blue-600"
            }`}
          >
            V3k&nbsp;-&nbsp;AI Trading Bot
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-700"}>
            Turning signals into success
          </p>
        </div>

        <div className="text-sm mt-2 md:mt-0">
          ⏱ {countdown}s
          <button
            onClick={() => setPaused((p) => !p)}
            className="ml-2 px-2 py-1 rounded text-xs bg-gray-700 text-white hover:bg-gray-600"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="ml-2 px-2 py-1 rounded text-xs bg-gray-700 text-white hover:bg-gray-600"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* live indices ticker */}
      <div
        className={`text-sm p-2 mb-3 rounded ${
          darkMode ? "bg-gray-900 text-blue-300" : "bg-gray-200 text-blue-700"
        } whitespace-nowrap overflow-x-auto`}
      >
        {indices.map((i, idx) => (
          <span key={idx} className="mx-2">
            {i.symbol} ₹{i.price} ({i.change}%)
            {idx < indices.length - 1 && " |"}
          </span>
        ))}
      </div>

      {/* controls */}
      <div className="mb-4 text-xs flex flex-wrap gap-2">
        <button
          onClick={fetchSignals}
          className="bg-cyan-600 px-3 py-1 rounded text-white"
        >
          🔄 Refresh
        </button>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh((a) => !a)}
          />{" "}
          Auto-refresh
        </label>
        <label>
          <input
            type="checkbox"
            checked={soundAlert}
            onChange={() => setSoundAlert((s) => !s)}
          />{" "}
          🔔 Sound
        </label>
        <label>
          <input
            type="checkbox"
            checked={compactView}
            onChange={() => setCompactView((c) => !c)}
          />{" "}
          Compact
        </label>
      </div>

      {/* dynamic filters */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {Object.keys(strategyFilters).map((tag) => (
          <button
            key={tag}
            onClick={() => toggle(setStrategyFilters, tag)}
            className={`px-2 py-1 rounded-full border ${
              strategyFilters[tag]
                ? "bg-cyan-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            #{tag}
          </button>
        ))}
        {Object.keys(typeFilters).map((t) => (
          <button
            key={t}
            onClick={() => toggle(setTypeFilters, t)}
            className={`px-2 py-1 rounded-full border ${
              typeFilters[t]
                ? "bg-yellow-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {t}
          </button>
        ))}
        {Object.keys(timeframeFilters).map((tf) => (
          <button
            key={tf}
            onClick={() => toggle(setTimeframeFilters, tf)}
            className={`px-2 py-1 rounded-full border ${
              timeframeFilters[tf]
                ? "bg-pink-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* signal cards */}
      <div
        className={`grid ${
          compactView
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "grid-cols-1 gap-4"
        }`}
      >
        {filteredSignals.map((s, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedSignal(s)}
            className={`p-4 rounded-xl shadow-md border cursor-pointer transition-all ${
              darkMode
                ? "bg-gray-900 border-gray-700 hover:shadow-lg"
                : "bg-white border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-yellow-400">{s.symbol}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  s.signalType === "Buy" ? "bg-green-600" : "bg-red-600"
                } text-white`}
              >
                {s.signalType}
              </span>
            </div>

            <p className="text-xs text-gray-400">Strategy: {s.strategy}</p>
            <p className="text-xs text-gray-500">
              Type: {s.type} | TF: {s.timeframe}
            </p>
            <p className="text-sm mt-1">Price: ₹{s.price}</p>

            <div className="mt-2 text-sm text-yellow-300">
              Entry: ₹{s.entryPrice} | Target: ₹{s.exitPrice} | SL: ₹
              {s.stopLoss} | R:R&nbsp;= {s.riskRewardRatio}
            </div>

            {/* strength bar */}
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Strength</span>
                <span>{s.strength ? `${s.strength}%` : "—"}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded">
                <div
                  className="h-2 rounded bg-gradient-to-r from-green-400 to-blue-500"
                  style={{ width: `${s.strength || 70}%` }}
                />
              </div>
            </div>

            {/* sparkline */}
            {s.sparkline && (
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={50}>
                  <AreaChart
                    data={s.sparkline.map((v, i) => ({ idx: i, value: v }))}
                  >
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0ff"
                      fill="#0ff"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* news */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">📰 Market News</h2>
        <ul className="space-y-1 list-disc pl-4 text-blue-400 text-sm">
          {news.map((n, idx) => (
            <li key={idx}>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {n.title} –{" "}
                <span className="text-gray-400">{n.source}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* modal */}
      <ChartModal
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
        darkMode={darkMode}
      />
    </div>
  );
};

export default App;
