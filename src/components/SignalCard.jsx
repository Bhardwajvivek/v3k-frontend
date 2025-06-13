import React from 'react';
import Sparkline from './Sparkline';

const SignalCard = ({ signal, onClick, darkMode }) => {
  if (!signal || !signal.symbol) return null;

  const getStrengthColor = (strength) => {
    if (strength >= 90) return 'bg-green-500';
    if (strength >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`w-full max-w-xs rounded-2xl p-4 shadow-md border cursor-pointer transform transition-all duration-300 hover:scale-[1.02]
      ${darkMode ? 'bg-[#202534] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
      onClick={() => onClick(signal)}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold tracking-wide">{signal.symbol}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getStrengthColor(signal.strength)}`}>
          {signal.strength || 0}%
        </span>
      </div>

      <p className="text-sm text-blue-400 font-medium">{signal.strategy}</p>

      {/* Sparkline Chart */}
      {signal.sparkline && (
        <div className="my-2">
          <Sparkline data={signal.sparkline} />
        </div>
      )}

      <div className="text-sm mt-1 space-y-1">
        <p>🕒 {signal.timeframe || 'N/A'}</p>
        <p>💼 {signal.type || 'N/A'}</p>
        <p>💰 ₹{signal.price || '0.00'}</p>
      </div>

      {/* Option Chain Details */}
      {signal.option_chain_analysis && (
        <div className="mt-3 text-xs bg-black/20 p-2 rounded-lg border border-gray-600 space-y-1">
          <div className="font-semibold text-blue-300">📈 Option Chain</div>
          <p>Max Pain: ₹{signal.option_chain_analysis.max_pain}</p>
          <p>OI: {signal.option_chain_analysis.open_interest}</p>
          <p>Change OI: {signal.option_chain_analysis.change_in_oi}</p>
          <p>Unsettled: {signal.option_chain_analysis.unsettled_trades}</p>
          <p>PCR: {signal.option_chain_analysis.put_call_ratio}</p>
        </div>
      )}

      {/* Optional: Tag list */}
      {signal.tags && signal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {signal.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalCard;
