// App.jsx – FINAL (backend = v3k-backend-clean)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import ChartModal from "./components/ChartModal";

/* ---------- 1. BACKEND BASE URL (locked) ---------- */
const API_URL = "https://v3k-backend-clean.onrender.com";

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
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  /* ---------- 4. Fetchers ---------- */
  const fetchSignals = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-signals`);
      const raw = res.data?.signals || [];

      const enriched = raw.map((s) => {
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

      /* 🔔 voice alert on NEW top-3 */
      const top3 = [...enriched].sort((a, b) => b.strength - a.strength).slice(0, 3);
      const newIds = new Set(top3.map((s) => `${s.symbol}_${s.timeframe}`));
      top3.forEach((s) => {
        const id = `${s.symbol}_${s.timeframe}`;
        if (!prevSignalIds.current.has(id)) speakAlert(`Top ${s.signalType} on ${s.symbol}`);
      });
      prevSignalIds.current = newIds;

      setSignals(enriched.sort((a, b) => b.strength - a.strength).slice(0, 10));

      /* dynamic filter sets */
      const tagSet = new Set(), typeSet = new Set(), tfSet = new Set();
      enriched.forEach((s) => {
        (s.strategyTags || []).forEach((t) => tagSet.add(t));
        if (s.type) typeSet.add(s.type);
        if (s.timeframe) tfSet.add(s.timeframe);
      });

      setStrategyFilters((p) => Object.fromEntries([...tagSet].map((t) => [t, p?.[t] || false])));
      setTypeFilters((p) => Object.fromEntries([...typeSet].map((t) => [t, p?.[t] || false])));
      setTimeframeFilters((p) => Object.fromEntries([...tfSet].map((t) => [t, p?.[t] || false])));
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

  /* ---------- 5. Initial Load ---------- */
  useEffect(() => {
    fetchSignals();
    fetchIndices();
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 6. Auto-Refresh ---------- */
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
    }, 1000);
    return () => clearInterval(id);
  }, [autoRefresh, paused]);

  /* ---------- 7. Filtering ---------- */
  const toggle = (setter, key) => setter((p) => ({ ...p, [key]: !p[key] }));

  const filteredSignals = signals.filter((s) => {
    const tagOK =
      Object.values(strategyFilters).some(Boolean)
        ? (s.strategyTags || []).some((t) => strategyFilters[t])
        : true;
    const typeOK = Object.values(typeFilters).some(Boolean) ? typeFilters[s.type] : true;
    const tfOK = Object.values(timeframeFilters).some(Boolean) ? timeframeFilters[s.timeframe] : true;
    return tagOK && typeOK && tfOK;
  });

  /* ---------- 8. Render (unchanged) ---------- */
  return (
    /* … (rest of your JSX remains exactly the same as current file) … */
  );
};

export default App;
