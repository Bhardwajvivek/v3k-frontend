import React from 'react';

const FirebaseTradeSummary = ({ trades }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-lg font-semibold mb-2">📊 Trade Summary</h2>
      <div className="h-40 overflow-y-auto pr-2 custom-scroll">
        {trades && trades.length > 0 ? (
          trades.map((trade, index) => (
            <div key={index} className="mb-1 text-sm border-b border-gray-700 pb-1">
              <p><strong>{trade.symbol}</strong> | {trade.strategy}</p>
              <p className="text-green-400">P&L: ₹{trade.pnl}</p>
              <p className="text-gray-400">{trade.date}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No trade logs yet.</p>
        )}
      </div>
    </div>
  );
};

export default FirebaseTradeSummary;
