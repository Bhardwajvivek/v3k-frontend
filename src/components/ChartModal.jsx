import React, { useEffect, useRef } from 'react';

const ChartModal = ({ signal, onClose, darkMode }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!signal || !signal.symbol || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: signal.symbol.replace('.NS', 'NSE:'),
      interval: '15',
      timezone: 'Asia/Kolkata',
      theme: darkMode ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: 'tv_chart_container',
    });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);
  }, [signal, darkMode]);

  if (!signal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 w-full max-w-6xl relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-blue-400">
            📈 {signal.symbol} Chart
          </h3>
          <button
            className="text-xs text-red-400 hover:underline"
            onClick={onClose}
          >
            ✖ Close
          </button>
        </div>
        <div
          id="tv_chart_container"
          ref={containerRef}
          className="w-full h-[500px]"
        />
      </div>
    </div>
  );
};

export default ChartModal;
