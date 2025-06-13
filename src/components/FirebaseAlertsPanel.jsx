import React from 'react';

const FirebaseAlertsPanel = ({ alerts }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">📲 Telegram Alerts Log</h2>
      <div className="h-40 overflow-y-auto pr-2 custom-scroll">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div key={index} className="mb-1 text-sm border-b border-gray-700 pb-1">
              <p><strong>{alert.symbol}</strong> | {alert.strategy}</p>
              <p className="text-gray-400">{alert.timeframe} • ₹{alert.price}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No alerts found yet.</p>
        )}
      </div>
    </div>
  );
};

export default FirebaseAlertsPanel;
