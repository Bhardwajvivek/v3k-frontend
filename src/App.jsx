import React, { useState, useEffect, useRef, useCallback } from "react";

const V3KTradingDashboard = () => {
  const [signals, setSignals] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isDark, setIsDark] = useState(true);
  const [alertsOn, setAlertsOn] = useState(true);
  const [livePrices, setLivePrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [strengthFilter, setStrengthFilter] = useState(60);
  const [confidenceFilter, setConfidenceFilter] = useState(50);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  
  const audioRef = useRef(null);
  const API_URL = "https://v3k-backend-api.onrender.com";
  const refreshIntervalRef = useRef(null);

  // Request desktop notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setDesktopNotifications(permission === "granted");
        });
      } else {
        setDesktopNotifications(Notification.permission === "granted");
      }
    }
  }, []);

  // Desktop notification function
  const showDesktopNotification = useCallback((signal) => {
    if (desktopNotifications && "Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("🚀 V3K Strong Buy Alert!", {
        body: `${signal.symbol} - ${signal.strength}% strength\n${signal.strategy}`,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
        requireInteraction: true,
        tag: signal.symbol
      });
      
      notification.onclick = () => {
        window.focus();
        setSelectedSignal(signal);
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    }
  }, [desktopNotifications]);

  // Enhanced Auto alert logic - 100% priority, then 95% backup
  const checkAutoAlerts = useCallback((newSignals) => {
    if (!alertsOn) return;

    // Filter Strong Buy signals only
    const strongBuySignals = newSignals.filter(signal => signal.signalType === "Strong Buy");
    
    // Check for 100% strength signals first
    const perfect100Signals = strongBuySignals.filter(signal => signal.strength >= 100);
    const excellent95Signals = strongBuySignals.filter(signal => signal.strength >= 95 && signal.strength < 100);
    
    // Helper function to send alerts
    const sendAlert = async (signal) => {
      try {
        console.log("📱 Sending auto alert for:", signal.symbol);
        
        const alertResponse = await fetch(`${API_URL}/send-telegram-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: signal.symbol,
            strength: signal.strength,
            strategy: signal.strategy,
            type: signal.signalType,
            entry: signal.entry || signal.price,
            target: signal.exit || signal.target1,
            target2: signal.target2,
            target3: signal.target3,
            stoploss: signal.stoploss,
            trailingSL: signal.trailingSL,
            timeframe: signal.timeframe,
            confidence: signal.confidence,
            riskReward: signal.riskReward
          })
        });
        
        if (alertResponse.ok) {
          console.log("✅ Auto alert sent successfully for:", signal.symbol);
        }
      } catch (err) {
        console.error("❌ Auto alert error:", err);
      }
    };
    
    // Priority 1: Send alerts for 100% signals immediately
    if (perfect100Signals.length > 0) {
      console.log(`🎯 FOUND ${perfect100Signals.length} PERFECT 100% SIGNALS - SENDING PRIORITY ALERTS!`);
      
      perfect100Signals.forEach(signal => {
        // Send Telegram alert
        sendAlert(signal);
        
        // Show enhanced desktop notification for 100% signals
        if (desktopNotifications && "Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("🎯 PERFECT 100% SIGNAL!", {
            body: `${signal.symbol} - MAXIMUM STRENGTH!\n${signal.strategy}`,
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>",
            requireInteraction: true,
            tag: `perfect-${signal.symbol}`,
            vibrate: [200, 100, 200, 100, 200]
          });
          
          notification.onclick = () => {
            window.focus();
            setSelectedSignal(signal);
            notification.close();
          };

          setTimeout(() => notification.close(), 15000);
        }
        
        // Play sound for 100% signals
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        
        console.log(`🎯 PERFECT ALERT: ${signal.symbol} - 100% STRENGTH! MAXIMUM CONFIDENCE!`);
      });
      
      // Don't send 95% alerts if we have 100% signals
      return;
    }
    
    // Priority 2: Send alerts for 95% signals only if no 100% signals exist
    if (excellent95Signals.length > 0) {
      console.log(`🚀 FOUND ${excellent95Signals.length} EXCELLENT 95%+ SIGNALS - SENDING BACKUP ALERTS`);
      
      excellent95Signals.forEach(signal => {
        // Send Telegram alert
        sendAlert(signal);
        
        // Show standard desktop notification for 95% signals
        showDesktopNotification(signal);
        
        // Play sound
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        
        console.log(`🚀 EXCELLENT ALERT: ${signal.symbol} - ${signal.strength}% strength!`);
      });
    }
    
    // Log summary
    if (strongBuySignals.length > 0) {
      console.log(`📊 ALERT SUMMARY: ${perfect100Signals.length} Perfect (100%), ${excellent95Signals.length} Excellent (95%+), ${strongBuySignals.length} Total Strong Buy`);
    }
  }, [alertsOn, showDesktopNotification]);

  // Mock data for fallback with ALL price levels
  const mockSignals = [
    {
      symbol: "RELIANCE.NS",
      strategy: "EMA Golden Cross + Volume Breakout + Supertrend Bullish",
      strategyTags: ["EMA Golden Cross", "Volume Breakout", "Supertrend Bullish"],
      timeframe: "15m",
      type: "equity",
      signalType: "Strong Buy",
      price: 2847.65,
      change: 45.30,
      changePercent: 1.62,
      volume: 1250000,
      strength: 87,
      confidence: 82,
      entry: 2850.00,
      exit: 2920.00,
      target1: 2920.00,
      target2: 2980.00,
      target3: 3040.00,
      stoploss: 2785.00,
      trailingSL: 2800.00,
      riskReward: 1.85,
      timestamp: new Date().toISOString()
    },
    {
      symbol: "TCS.NS",
      strategy: "EMA Cross + Quick Momentum",
      strategyTags: ["EMA Cross", "Volume Surge", "Quick Momentum"],
      timeframe: "3m",
      type: "scalping",
      signalType: "Quick Buy",
      price: 4125.30,
      strength: 72,
      confidence: 68,
      entry: 4126.00,
      exit: 4145.00,
      target1: 4145.00,
      target2: 4155.00,
      stoploss: 4115.00,
      trailingSL: 4118.00,
      riskReward: 1.7,
      timestamp: new Date().toISOString()
    },
    {
      symbol: "HDFCBANK26500CE",
      strategy: "Volume Spike + IV Crush + Delta Momentum",
      strategyTags: ["Volume Spike", "IV Crush", "Delta Momentum"],
      timeframe: "15m",
      type: "option",
      signalType: "Buy",
      price: 45.80,
      strike: 26500,
      expiry: "WEEKLY",
      iv: 24.5,
      delta: 0.68,
      volume: 89000,
      strength: 78,
      confidence: 75,
      entry: 46.00,
      exit: 65.00,
      target1: 65.00,
      target2: 85.00,
      target3: 105.00,
      stoploss: 38.00,
      trailingSL: 40.00,
      riskReward: 2.4,
      timestamp: new Date().toISOString()
    }
  ];

  // Open chart in new window/tab
  const openChart = (symbol) => {
    const cleanSymbol = symbol.replace('.NS', '').replace('.BSE', '');
    const chartUrl = `https://www.tradingview.com/chart/?symbol=NSE:${cleanSymbol}`;
    window.open(chartUrl, '_blank', 'width=1200,height=800');
    console.log(`📈 Opening chart for ${cleanSymbol}`);
  };

  // Fetch live signals from Flask backend
  const fetchSignalsFromAPI = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching live signals from backend...");
      
      const signalsResponse = await fetch(`${API_URL}/get-signals`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!signalsResponse.ok) {
        throw new Error(`Backend responded with status: ${signalsResponse.status}`);
      }
      
      const signalsData = await signalsResponse.json();
      console.log("✅ Received signals data:", signalsData);
      
      const liveSignals = signalsData.signals || [];
      
      checkAutoAlerts(liveSignals);
      
      setSignals(liveSignals);
      setIsConnected(true);
      setLastUpdateTime(new Date());
      
      const livePriceData = {};
      liveSignals.forEach(signal => {
        livePriceData[signal.symbol] = {
          price: signal.price,
          change: signal.change || 0,
          changePercent: signal.changePercent || 0
        };
      });
      setLivePrices(livePriceData);
      
      const total = liveSignals.length;
      const strongBuy = liveSignals.filter(s => s.signalType === "Strong Buy").length;
      const buy = liveSignals.filter(s => s.signalType === "Buy").length;
      const avgStrength = total > 0 ? Math.round(liveSignals.reduce((sum, s) => sum + (s.strength || 0), 0) / total) : 0;
      const avgConfidence = total > 0 ? Math.round(liveSignals.reduce((sum, s) => sum + (s.confidence || 0), 0) / total) : 0;
      
      let marketSentiment = "Neutral";
      if (strongBuy > total * 0.3) marketSentiment = "Very Bullish";
      else if ((strongBuy + buy) > total * 0.6) marketSentiment = "Bullish";
      else if ((strongBuy + buy) > total * 0.4) marketSentiment = "Moderately Bullish";
      
      setAnalytics({
        total, strongBuy, buy, avgStrength, avgConfidence, marketSentiment
      });
      
      console.log(`📊 Processed ${total} live signals. Market sentiment: ${marketSentiment}`);
      
    } catch (err) {
      console.error("❌ Error fetching live signals:", err);
      setIsConnected(false);
      setSignals(mockSignals);
      
      const total = mockSignals.length;
      const strongBuy = mockSignals.filter(s => s.signalType === "Strong Buy").length;
      const avgStrength = Math.round(mockSignals.reduce((sum, s) => sum + s.strength, 0) / total);
      const avgConfidence = Math.round(mockSignals.reduce((sum, s) => sum + s.confidence, 0) / total);
      
      setAnalytics({ total, strongBuy, avgStrength, avgConfidence, marketSentiment: "Demo Mode" });
    } finally {
      setLoading(false);
    }
  }, [checkAutoAlerts]);

  // Auto refresh functionality
  useEffect(() => {
    fetchSignalsFromAPI();
    
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        console.log("🔄 Auto-refreshing signals...");
        fetchSignalsFromAPI();
      }, 30000);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, fetchSignalsFromAPI]);

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    if (!autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        fetchSignalsFromAPI();
      }, 30000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  };

  const getStrengthColor = (val) => {
    if (val >= 85) return "#00ff88";
    if (val >= 75) return "#ffaa00";
    if (val >= 65) return "#00aaff";
    return "#ff4466";
  };

  const getSignalTypeColor = (type) => {
    switch(type) {
      case "Strong Buy": return "#00ff88";
      case "Buy": return "#00aaff";
      case "Quick Buy": return "#ffaa00";
      default: return "#64748b";
    }
  };

  const filteredSignals = signals.filter(s => {
    const strengthCheck = (s.strength || 0) >= strengthFilter;
    const confidenceCheck = (s.confidence || 50) >= confidenceFilter;
    return strengthCheck && confidenceCheck;
  }).sort((a, b) => (b.strength || 0) - (a.strength || 0));

  const toggleAlerts = () => setAlertsOn(!alertsOn);

  // Enhanced Signal Card Component
  const SignalCard = ({ signal }) => {
    const typeEmoji = signal.type === "option" ? "🎯" : signal.type === "scalping" ? "⚡" : "🔥";
    const signalColor = getSignalTypeColor(signal.signalType);
    const strengthDisplay = signal.strength || 0;
    const confidenceDisplay = signal.confidence || 0;
    
    return (
      <div
        onClick={() => setSelectedSignal(signal)}
        onDoubleClick={() => openChart(signal.symbol)}
        style={{
          background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${getStrengthColor(strengthDisplay)}`,
          borderRadius: '16px',
          padding: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${getStrengthColor(strengthDisplay)}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        }}
        title="Single click for details, Double click to open chart"
      >
        {/* Top glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg, transparent, ${getStrengthColor(strengthDisplay)}, transparent)`,
          opacity: 0.8
        }} />
        
        {/* Enhanced Auto alert indicator with 100% priority display */}
        {((strengthDisplay >= 100) || (strengthDisplay >= 95 && signal.signalType === "Strong Buy")) && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: strengthDisplay >= 100 
              ? 'linear-gradient(135deg, #ffd700, #ffed4a)' // Gold for 100%
              : 'linear-gradient(135deg, #ff6b00, #ff8500)', // Orange for 95%
            color: strengthDisplay >= 100 ? '#000' : '#fff',
            padding: '4px 8px', borderRadius: '12px',
            fontSize: '10px', fontWeight: '800',
            border: strengthDisplay >= 100 ? '1px solid #ffd700' : 'none',
            boxShadow: strengthDisplay >= 100 
              ? '0 0 10px rgba(255, 215, 0, 0.5)' 
              : '0 0 8px rgba(255, 107, 0, 0.4)'
          }}>
            {strengthDisplay >= 100 ? '🎯 PERFECT 100%' : '🚨 AUTO ALERT'}
          </div>
        )}
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{typeEmoji}</span>
              <h3 style={{ 
                fontSize: '20px', fontWeight: '800', 
                color: isDark ? '#ffffff' : '#111827', margin: 0
              }}>
                {signal.symbol || 'Unknown'}
              </h3>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isConnected ? '#00ff88' : '#ff4466'
              }} />
              {!isConnected && (
                <span style={{
                  background: '#ff4466', color: 'white', padding: '2px 8px',
                  borderRadius: '12px', fontSize: '10px', fontWeight: '700'
                }}>DEMO</span>
              )}
            </div>
            
            <div style={{
              background: `linear-gradient(135deg, ${signalColor}20, ${signalColor}10)`,
              color: signalColor, padding: '6px 12px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', display: 'inline-block',
              marginBottom: '8px', border: `1px solid ${signalColor}40`
            }}>
              {signal.signalType || 'Signal'}
            </div>
            
            <p style={{ 
              fontSize: '13px', color: isDark ? '#8892b0' : '#6b7280',
              margin: '4px 0 0 0', fontWeight: '500'
            }}>
              {signal.strategy || (signal.strategyTags ? signal.strategyTags.join(' + ') : 'Multi-Strategy')}
            </p>
            
            <div style={{ 
              fontSize: '11px', color: isDark ? '#64748b' : '#9ca3af',
              marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap'
            }}>
              {signal.timeframe && <span>⏱️ {signal.timeframe}</span>}
              {signal.type === "scalping" && <span>⚡ Quick Trade</span>}
              {signal.type === "option" && signal.strike && <span>🎯 Strike: ₹{signal.strike}</span>}
              <span style={{ color: '#60a5fa', fontWeight: '600' }}>📈 Double-click for chart</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{
              background: `linear-gradient(135deg, ${getStrengthColor(strengthDisplay)}, ${getStrengthColor(strengthDisplay)}dd)`,
              color: strengthDisplay >= 75 ? '#000' : '#fff',
              padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
              textAlign: 'center', minWidth: '60px',
              boxShadow: `0 4px 12px ${getStrengthColor(strengthDisplay)}40`
            }}>
              {strengthDisplay}%
            </div>
            {confidenceDisplay > 0 && (
              <div style={{
                fontSize: '11px', color: isDark ? '#8892b0' : '#6b7280', fontWeight: '600'
              }}>
                Conf: {confidenceDisplay}%
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '28px', fontWeight: '800', 
            color: isDark ? '#ffffff' : '#111827', marginBottom: '8px'
          }}>
            ₹{(livePrices[signal.symbol]?.price || signal.price || signal.entry || 0)?.toFixed?.(2) || (signal.price || signal.entry || 0)}
            {signal.change && (
              <span style={{ 
                fontSize: '14px',
                color: signal.change > 0 ? '#00ff88' : '#ff4466',
                fontWeight: '700', marginLeft: '8px'
              }}>
                {signal.change > 0 ? '+' : ''}₹{signal.change} ({signal.changePercent?.toFixed(2)}%)
              </span>
            )}
          </div>
          {signal.volume && (
            <div style={{ 
              fontSize: '12px', color: isDark ? '#8892b0' : '#6b7280', fontWeight: '600'
            }}>
              Volume: {signal.volume.toLocaleString()}
            </div>
          )}
        </div>

        {/* Enhanced Trading levels - FIXED to show ALL price levels */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '12px', marginBottom: '20px', fontSize: '12px'
        }}>
          {/* Entry Price - Always show */}
          <div style={{ 
            background: 'rgba(0, 255, 136, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(0, 255, 136, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Entry</div>
            <div style={{ fontWeight: '800', color: '#00ff88', fontSize: '14px' }}>
              ₹{signal.entry || signal.price || 0}
            </div>
          </div>
          
          {/* Target 1 */}
          <div style={{ 
            background: 'rgba(255, 170, 0, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255, 170, 0, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Target 1</div>
            <div style={{ fontWeight: '800', color: '#ffaa00', fontSize: '14px' }}>
              ₹{signal.exit || signal.target1 || (signal.entry ? (signal.entry * 1.02).toFixed(2) : 0)}
            </div>
          </div>
          
          {/* Target 2 */}
          <div style={{ 
            background: 'rgba(255, 170, 0, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255, 170, 0, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Target 2</div>
            <div style={{ fontWeight: '800', color: '#ffaa00', fontSize: '14px' }}>
              ₹{signal.target2 || (signal.entry ? (signal.entry * 1.04).toFixed(2) : 0)}
            </div>
          </div>
          
          {/* Target 3 */}
          <div style={{ 
            background: 'rgba(255, 170, 0, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255, 170, 0, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Target 3</div>
            <div style={{ fontWeight: '800', color: '#ffaa00', fontSize: '14px' }}>
              ₹{signal.target3 || (signal.entry ? (signal.entry * 1.06).toFixed(2) : 0)}
            </div>
          </div>
          
          {/* Stop Loss */}
          <div style={{ 
            background: 'rgba(255, 68, 102, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255, 68, 102, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Stop Loss</div>
            <div style={{ fontWeight: '800', color: '#ff4466', fontSize: '14px' }}>
              ₹{signal.stoploss || (signal.entry ? (signal.entry * 0.98).toFixed(2) : 0)}
            </div>
          </div>
          
          {/* Trailing SL */}
          <div style={{ 
            background: 'rgba(255, 68, 102, 0.12)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255, 68, 102, 0.25)'
          }}>
            <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Trailing SL</div>
            <div style={{ fontWeight: '800', color: '#ff4466', fontSize: '14px' }}>
              ₹{signal.trailingSL || (signal.entry ? (signal.entry * 0.985).toFixed(2) : 0)}
            </div>
          </div>
          
          {/* Risk Reward - Show if available */}
          {signal.riskReward && (
            <div style={{ 
              background: 'rgba(0, 170, 255, 0.12)', padding: '12px', borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.25)', gridColumn: 'span 2'
            }}>
              <div style={{ color: isDark ? '#8892b0' : '#6b7280', marginBottom: '4px' }}>Risk:Reward Ratio</div>
              <div style={{ fontWeight: '800', color: '#00aaff', fontSize: '14px' }}>{signal.riskReward}</div>
            </div>
          )}
        </div>

        {/* Strategy tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {(signal.strategyTags || []).slice(0, 4).map((tag, i) => (
            <span key={i} style={{
              padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Enhanced action buttons with working Alert functionality */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            data-symbol={signal.symbol}
            onClick={(e) => {
              e.stopPropagation();
              sendTelegramAlert(signal);
            }}
            style={{
              background: isConnected 
                ? 'linear-gradient(135deg, #0088cc, #0066aa)' 
                : 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white', border: 'none', padding: '8px 16px',
              borderRadius: '8px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', flex: 1, transition: 'all 0.3s ease'
            }}
            disabled={!isConnected}
            title={isConnected ? `Send Telegram alert for ${signal.symbol}` : 'Backend not connected'}
          >
            📱 {isConnected ? 'Alert' : 'Offline'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openChart(signal.symbol);
            }}
            style={{
              background: 'linear-gradient(135deg, #00aa88, #008866)',
              color: 'white', border: 'none', padding: '8px 16px',
              borderRadius: '8px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', flex: 1
            }}
            title={`Open TradingView chart for ${signal.symbol}`}
          >
            📈 Chart
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Adding to watchlist:", signal.symbol);
              // You can implement watchlist functionality here
            }}
            style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white', border: 'none', padding: '8px 16px',
              borderRadius: '8px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', flex: 1
            }}
            title={`Add ${signal.symbol} to watchlist`}
          >
            ⭐ Watch
          </button>
        </div>

        {/* Timestamp */}
        <div style={{ 
          fontSize: '10px', color: isDark ? '#64748b' : '#9ca3af', textAlign: 'right'
        }}>
          {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : 'Live'}
        </div>
      </div>
    );
  };

  // Analytics Card
  const AnalyticsCard = ({ title, value, subtitle, color = "#00aaff", icon }) => (
    <div style={{
      background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      border: `1px solid ${color}40`, borderRadius: '16px', padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ 
          fontWeight: '700', color: isDark ? '#ccd6f6' : '#374151',
          margin: 0, fontSize: '14px'
        }}>
          {title}
        </h3>
        {icon && <span style={{ fontSize: '28px' }}>{icon}</span>}
      </div>
      
      <div style={{ 
        fontSize: '36px', fontWeight: '800', color: color,
        textShadow: `0 0 20px ${color}40`, marginBottom: '8px'
      }}>
        {value}
      </div>
      
      {subtitle && (
        <div style={{ 
          fontSize: '12px', color: isDark ? '#8892b0' : '#6b7280', fontWeight: '600'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #0f0f23 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCI7N8dSGOQodZ7zn559REwxSp+LqtmMfDjq" type="audio/wav" />
      </audio>

      {/* Header */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px',
        background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        padding: '32px', borderRadius: '20px',
        border: isDark ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid rgba(203, 213, 225, 0.5)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '42px', fontWeight: '900', 
            background: 'linear-gradient(135deg, #00ff88, #00aaff, #aa66ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0
          }}>
            V3K AI Trading Bot Pro
          </h1>
          <p style={{ 
            fontSize: '16px', color: isDark ? '#8892b0' : '#6b7280',
            margin: '8px 0 0 0', fontWeight: '600'
          }}>
            Professional Trading Signal Dashboard & Live Analytics
          </p>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            marginTop: '12px', fontSize: '14px', color: isDark ? '#64748b' : '#9ca3af'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isConnected ? '#00ff88' : '#ff4466'
              }} />
              <span>{isConnected ? 'Live Connected' : 'Demo Mode'}</span>
            </div>
            {lastUpdateTime && (
              <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
            )}
            {autoRefreshEnabled && (
              <span style={{ color: '#00ff88' }}>🔄 Auto-refresh ON</span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchSignalsFromAPI}
            disabled={loading}
            style={{
              background: loading ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #00aaff, #0088cc)',
              color: 'white', padding: '16px 28px', borderRadius: '12px',
              fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(0, 170, 255, 0.3)', fontSize: '14px'
            }}
          >
            {loading ? '⏳ Scanning...' : '🔄 Refresh'}
          </button>
          
          <button 
            onClick={toggleAutoRefresh}
            style={{
              background: autoRefreshEnabled ? 'linear-gradient(135deg, #00ff88, #00cc66)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: autoRefreshEnabled ? '#000' : 'white', padding: '16px 28px', borderRadius: '12px',
              fontWeight: '700', border: 'none', cursor: 'pointer',
              boxShadow: `0 8px 20px ${autoRefreshEnabled ? 'rgba(0, 255, 136, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
              fontSize: '14px'
            }}
          >
            🔄 Auto: {autoRefreshEnabled ? 'ON' : 'OFF'}
          </button>
          
          <button 
            onClick={toggleAlerts}
            style={{
              background: alertsOn ? 'linear-gradient(135deg, #ff6b00, #ff8500)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white', padding: '16px 28px', borderRadius: '12px',
              fontWeight: '700', border: 'none', cursor: 'pointer',
              boxShadow: `0 8px 20px ${alertsOn ? 'rgba(255, 107, 0, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
              fontSize: '14px'
            }}
          >
            {alertsOn ? '🚨' : '🔕'} Alerts: {alertsOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <AnalyticsCard 
          title="Total Signals" 
          value={analytics.total || 0}
          subtitle="Active opportunities"
          color="#00ff88"
          icon="📊"
        />
        <AnalyticsCard 
          title="Strong Buy" 
          value={analytics.strongBuy || 0} 
          subtitle={`${Math.round(((analytics.strongBuy || 0) / (analytics.total || 1)) * 100)}% of total`}
          color="#ff4466"
          icon="🚀"
        />
        <AnalyticsCard 
          title="Avg Strength" 
          value={`${analytics.avgStrength || 0}%`} 
          subtitle="Signal quality"
          color="#ffaa00"
          icon="💪"
        />
        <AnalyticsCard 
          title="Market Sentiment" 
          value={analytics.marketSentiment || "Neutral"} 
          subtitle="Overall mood"
          color="#aa66ff"
          icon="🌡️"
        />
        <AnalyticsCard 
          title="Auto Alerts" 
          value={alertsOn ? "ACTIVE" : "OFF"} 
          subtitle={alertsOn ? "100% Priority, 95% Backup" : "Alerts disabled"}
          color={alertsOn ? "#ffd700" : "#6b7280"}
          icon="🎯"
        />
        <AnalyticsCard 
          title="Refresh Rate" 
          value="30s" 
          subtitle={autoRefreshEnabled ? "Auto-refresh enabled" : "Manual refresh"}
          color="#00aaff"
          icon="🔄"
        />
      </div>

      {/* Filters */}
      <div style={{ 
        background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        padding: '24px', borderRadius: '16px',
        border: isDark ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid rgba(203, 213, 225, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', marginBottom: '24px'
      }}>
        <h3 style={{ 
          fontSize: '18px', fontWeight: '700', 
          color: isDark ? '#ffffff' : '#111827', marginBottom: '20px'
        }}>
          🎛️ Live Signal Filters & Controls
        </h3>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'
        }}>
          <div>
            <label style={{ 
              display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px',
              color: isDark ? '#ccd6f6' : '#374151'
            }}>
              Min Strength: {strengthFilter}%
            </label>
            <input
              type="range" min="50" max="100" value={strengthFilter}
              onChange={(e) => setStrengthFilter(Number(e.target.value))}
              style={{
                width: '100%', height: '8px', borderRadius: '4px',
                background: 'linear-gradient(90deg, #ff4466, #ffaa00, #00ff88)',
                outline: 'none', cursor: 'pointer'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px',
              color: isDark ? '#ccd6f6' : '#374151'
            }}>
              Min Confidence: {confidenceFilter}%
            </label>
            <input
              type="range" min="40" max="95" value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(Number(e.target.value))}
              style={{
                width: '100%', height: '8px', borderRadius: '4px',
                background: 'linear-gradient(90deg, #888888, #ffaa00, #00ff88)',
                outline: 'none', cursor: 'pointer'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {setStrengthFilter(100); setConfidenceFilter(90);}}
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4a)',
              color: '#000', padding: '8px 16px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
            }}
          >
            🎯 Perfect 100% Only
          </button>
          <button
            onClick={() => {setStrengthFilter(95); setConfidenceFilter(85);}}
            style={{
              background: 'linear-gradient(135deg, #ff6b00, #ff8500)',
              color: 'white', padding: '8px 16px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer'
            }}
          >
            🚨 Auto Alert Level (95%+)
          </button>
          <button
            onClick={() => {setStrengthFilter(85); setConfidenceFilter(80);}}
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00cc66)',
              color: '#000', padding: '8px 16px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer'
            }}
          >
            🔥 High Quality Only
          </button>
          <button
            onClick={() => {setStrengthFilter(60); setConfidenceFilter(50);}}
            style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white', padding: '8px 16px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer'
            }}
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '28px', fontWeight: '800', 
            color: isDark ? '#ffffff' : '#111827', margin: 0,
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            🔥 Live Trading Signals
            <span style={{
              background: isConnected ? 'linear-gradient(135deg, #00ff88, #00cc66)' : 'linear-gradient(135deg, #ff4466, #cc3344)',
              color: isConnected ? '#000' : '#fff',
              padding: '6px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: '700'
            }}>
              {filteredSignals.length} {isConnected ? 'Live' : 'Demo'}
            </span>
          </h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => filteredSignals.forEach(signal => sendTelegramAlert(signal))}
              disabled={!isConnected || filteredSignals.length === 0}
              style={{
                background: isConnected && filteredSignals.length > 0 
                  ? 'linear-gradient(135deg, #aa66ff, #8844dd)' 
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white', padding: '10px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: '600', border: 'none',
                cursor: isConnected && filteredSignals.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              📱 Send All Alerts
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
          {filteredSignals.map((signal, i) => (
            <SignalCard key={i} signal={signal} />
          ))}
        </div>
        
        {filteredSignals.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid rgba(203, 213, 225, 0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {isConnected ? '🔍' : '⚠️'}
            </div>
            <h3 style={{ 
              fontSize: '20px', fontWeight: '700', 
              color: isDark ? '#ffffff' : '#111827', marginBottom: '8px'
            }}>
              {isConnected ? 'No Signals Match Your Filters' : 'Backend Not Connected'}
            </h3>
            <p style={{ 
              color: isDark ? '#8892b0' : '#6b7280',
              fontSize: '14px', marginBottom: '20px'
            }}>
              {isConnected ? 
                'Try adjusting your strength and confidence filters to see more signals.' : 
                'Make sure your Flask backend is running on http://127.0.0.1:5000'
              }
            </p>
            <button
              onClick={() => {
                if (isConnected) {
                  setStrengthFilter(60);
                  setConfidenceFilter(50);
                } else {
                  fetchSignalsFromAPI();
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #00aaff, #0088cc)',
                color: 'white', padding: '12px 24px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer'
              }}
            >
              {isConnected ? 'Reset Filters' : 'Retry Connection'}
            </button>
          </div>
        )}
      </div>

{/* Watchlist Sidebar */}
<aside className="fixed top-0 left-0 h-full w-56 bg-zinc-900 shadow-md text-white z-50">
  <div className="p-4 border-b border-gray-700 font-bold text-lg">
    📈 Watchlist
  </div>
  <div className="overflow-y-auto h-[calc(100%-3rem)]">
    {[
      'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'ICICIBANK.NS',
      'HDFCBANK.NS', 'SBIN.NS', 'ADANIENT.NS', 'LT.NS'
    ].map((symbol) => (
      <div
        key={symbol}
        className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 transition cursor-pointer"
      >
        <span>{symbol.replace('.NS', '')}</span>
        <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
      </div>
    ))}
  </div>
</aside>


      {/* Signal Details Modal */}
      {selectedSignal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setSelectedSignal(null)}
        >
          <div 
            style={{
              maxWidth: '700px', width: '90%',
              background: isDark ? 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)' : '#ffffff',
              borderRadius: '16px', padding: '32px',
              border: `1px solid ${getStrengthColor(selectedSignal.strength || 0)}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', fontWeight: '700', 
                color: isDark ? '#ffffff' : '#111827', margin: 0
              }}>
                {selectedSignal.symbol} - Signal Details
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => openChart(selectedSignal.symbol)}
                  style={{
                    background: '#00aa88', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  📈 Open Chart
                </button>
                <button 
                  onClick={() => setSelectedSignal(null)}
                  style={{
                    background: '#ff4466', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '16px', color: isDark ? '#ccd6f6' : '#374151', lineHeight: '1.6'
            }}>
              <p><strong>Strategy:</strong> {selectedSignal.strategy}</p>
              <p><strong>Timeframe:</strong> {selectedSignal.timeframe}</p>
              <p><strong>Signal Type:</strong> {selectedSignal.signalType}</p>
              <p><strong>Strength:</strong> {selectedSignal.strength}%</p>
              <p><strong>Confidence:</strong> {selectedSignal.confidence}%</p>
              {selectedSignal.riskReward && <p><strong>Risk-Reward:</strong> {selectedSignal.riskReward}</p>}
              {selectedSignal.volume && <p><strong>Volume:</strong> {selectedSignal.volume.toLocaleString()}</p>}
              
              {selectedSignal.strategyTags && selectedSignal.strategyTags.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Strategy Components:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {selectedSignal.strategyTags.map((tag, i) => (
                      <span key={i} style={{
                        padding: '4px 12px', background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        border: '1px solid rgba(59, 130, 246, 0.25)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V3KTradingDashboard;