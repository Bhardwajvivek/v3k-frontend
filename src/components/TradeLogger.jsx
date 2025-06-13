import React from "react";

const TradeLogger = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">📝 Trade Logger</h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        All trades executed by the V3k AI Trading Bot will be recorded here and synced to Firebase.
      </p>
    </div>
  );
};

export default TradeLogger;
