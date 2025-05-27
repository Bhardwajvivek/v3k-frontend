import React from "react";

export default function ChartModal({ symbol, onClose }) {
  if (!symbol) return null;

  const chartSymbol = `NSE:${symbol.toUpperCase()}`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl overflow-hidden w-[90vw] h-[80vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-white text-xl font-bold z-10"
          onClick={onClose}
        >
          ✕
        </button>
        <iframe
          title="TradingView Chart"
          src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=15&theme=dark&style=1&locale=en`}
          frameBorder="0"
          allowTransparency="true"
          scrolling="no"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
