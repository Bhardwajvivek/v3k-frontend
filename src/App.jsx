/*  ░░░ App.jsx  ░░░  */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

console.log(">>> APP JSX LIVE");

/* ---------- 1. BACKEND BASE URL ---------- */
/* During development we pull from 127.0.0.1:10000.
   In production just set VITE_API_URL in your deployment env. */
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:10000").replace(/\/$/, "");

/* ---------- 2. Main Component ---------- */
const App = () => {
  const [signals, setSignals]           = useState([]);
  const [indices, setIndices]           = useState([]);
  const [news,    setNews]              = useState([]);
  const [autoRefresh, setAutoRefresh]   = useState(true);
  const [countdown, setCountdown]       = useState(60);
  const [soundAlert, setSoundAlert]     = useState(true);
  const [strategyFilters, setStrategyFilters]   = useState({});
  const [typeFilters,      setTypeFilters]      = useState({});
  const [timeframeFilters, setTimeframeFilters] = useState({});
  const [paused, setPaused]             = useState(false);
  const [darkMode, setDarkMode]         = useState(true);

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
      const res  = await axios.get(`${API_URL}/get-signals`);
      const raw  = res.data?.signals || [];

      const enriched = raw.map((s) => {
        const entry = s.entryPrice || s.price;
        let   sl    = s.stopLoss ?? entry * 0.98;
        const rr    = s.riskRewardRatio ?? 2.0;
        const tp    = entry + (entry - sl) * rr;

        if (["Buy", "Strong Buy"].includes(s.signalType)) {
          const risk = entry - sl;
          if (s.price > entry + risk * 1.5) sl = entry + risk * 0.5;
        } else {
          const risk = sl - entry;
          if (s.price < entry - risk * 1.5) sl = entry - risk * 0.5;
        }

        return {
          ...s,
          entryPrice:       +entry.toFixed(2),
          stopLoss:         +sl.toFixed(2),
          exitPrice:        +tp.toFixed(2),
          riskRewardRatio:  rr,
        };
      });

      /* 🔔 announce NEW top-3 */
      const top3   = [...enriched].sort((a,b)=>b.strength-a.strength).slice(0,3);
      const newIds = new Set(top3.map((s)=>`${s.symbol}_${s.timeframe}`));
      top3.forEach((s)=>{
        const id = `${s.symbol}_${s.timeframe}`;
        if (!prevSignalIds.current.has(id)) speakAlert(`Top ${s.signalType} on ${s.symbol}`);
      });
      prevSignalIds.current = newIds;

      setSignals(enriched.sort((a,b)=>b.strength-a.strength).slice(0,20));

      /* dynamic filter sets */
      const tagSet = new Set(), typeSet = new Set(), tfSet = new Set();
      enriched.forEach((s)=>{
        (s.strategyTags||[]).forEach((t)=>tagSet.add(t));
        if (s.type)      typeSet.add(s.type);
        if (s.timeframe) tfSet.add(s.timeframe);
      });
      setStrategyFilters(p=>Object.fromEntries([...tagSet].map(t=>[t,p?.[t]||false])));
      setTypeFilters(p=>Object.fromEntries([...typeSet].map(t=>[t,p?.[t]||false])));
      setTimeframeFilters(p=>Object.fromEntries([...tfSet].map(t=>[t,p?.[t]||false])));
    } catch (err) { console.error("❌ Error fetching signals", err); }
  };

  const fetchIndices = async () => {
    try { const res = await axios.get(`${API_URL}/get-live-indices`); setIndices(res.data||[]); }
    catch (e) { console.error("❌ Error fetching indices",e); }
  };

  const fetchNews = async () => {
    try { const res = await axios.get(`${API_URL}/get-market-news`); setNews(res.data||[]); }
    catch (e) { console.error("❌ Error fetching news",e); }
  };

  /* ---------- 5. Initial Load ---------- */
  useEffect(() => { fetchSignals(); fetchIndices(); fetchNews(); }, []);

  /* ---------- 6. Auto-Refresh ---------- */
  useEffect(()=>{
    const id = setInterval(()=>{
      if (!paused){
        setCountdown(c=>{
          if (c<=1){
            if (autoRefresh){ fetchSignals(); fetchIndices(); fetchNews(); }
            return 60;
          }
          return c-1;
        });
      }
    },1000);
    return ()=>clearInterval(id);
  },[autoRefresh,paused]);

  /* ---------- 7. Filtering ---------- */
  const filteredSignals = signals.filter((s)=>{
    const tagOK = Object.values(strategyFilters).some(Boolean)
      ? (s.strategyTags||[]).some(t=>strategyFilters[t])
      : true;
    const typeOK = Object.values(typeFilters).some(Boolean)
      ? (s.type ? typeFilters[s.type] : false)
      : true;
    const tfOK = Object.values(timeframeFilters).some(Boolean)
      ? (s.timeframe ? timeframeFilters[s.timeframe] : false)
      : true;
    return tagOK && typeOK && tfOK;
  });

  /* ---------- 8. Render ---------- */
  return (
    <div style={{
      background: darkMode ? "#111" : "#f7f7f7",
      minHeight: "100vh",
      color: darkMode ? "#fff" : "#000",
      fontFamily: "Segoe UI, sans-serif",
      padding:"20px"
    }}>
      <header style={{marginBottom:"25px"}}>
        <h2 style={{margin:0}}>✅ V3k AI Trading Bot Signal Dashboard</h2>
        <small style={{opacity:0.8}}>
          Connected to <b>{API_URL}</b> — auto-refresh&nbsp;
          {autoRefresh ? <span style={{color:"#0f0"}}>ON</span> : <span style={{color:"#f33"}}>OFF</span>}
          &nbsp;| next refresh in {countdown}s
        </small>
      </header>

      {/* --- Signal cards --- */}
      <section style={{
        display:"flex",
        flexWrap:"wrap",
        gap:"15px"
      }}>
        {filteredSignals.length === 0 && (
          <p style={{opacity:0.7}}>No signals match current filters.</p>
        )}

        {filteredSignals.map((s,idx)=>(
          <div key={idx} style={{
            background: darkMode ? "#222" : "#fff",
            border: darkMode ? "1px solid #333" : "1px solid #ddd",
            borderRadius:"8px",
            padding:"15px",
            width:"260px",
            boxShadow: darkMode ? "0 0 4px #000" : "0 0 6px rgba(0,0,0,.05)"
          }}>
            <h3 style={{margin:"0 0 6px"}}>{s.symbol}</h3>
            <p style={{margin:"2px 0"}}><b>{s.signalType}</b> • TF&nbsp;{s.timeframe}</p>
            <p style={{margin:"2px 0"}}>Price&nbsp;₹{s.price}</p>
            <p style={{margin:"2px 0"}}>SL&nbsp;₹{s.stopLoss} | TP&nbsp;₹{s.exitPrice}</p>
            <p style={{margin:"2px 0"}} style={{opacity:0.8,fontSize:"12px"}}>
              {s.strategy}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default App;
