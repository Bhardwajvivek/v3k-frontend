// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";

function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get-signals")
      .then((res) => res.json())
      .then((data) => {
        setSignals(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching signals:", err));
  }, []);

  const filteredSignals =
    filterType === "All"
      ? signals
      : signals.filter((s) =>
          filterType === "Buy"
            ? s.position_type?.toLowerCase().includes("buy")
            : filterType === "Sell"
            ? s.position_type?.toLowerCase().includes("sell")
            : true
        );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-4xl font-extrabold flex items-center gap-2">
                <span>📈</span> V3k - AI Trading Bot
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Turning signals into success
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded px-3 py-1 text-sm border bg-white text-black"
              >
                <option value="All">All Signals</option>
                <option value="Buy">Buy Only</option>
                <option value="Sell">Sell Only</option>
              </select>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
              >
                {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>

          {/* Signal Cards */}
          {loading ? (
            <p>Loading signals...</p>
          ) : filteredSignals.length === 0 ? (
            <p className="text-red-500">No signals found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSignals.map((s, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <h2 className="text-xl font-bold mb-2">{s.symbol}</h2>
                  <p>Type: {s.position_type}</p>
                  <p>Reason: {s.reason}</p>
                  <p>Entry: ₹{s.entry}</p>
                  <p>Exit: ₹{s.exit}</p>
                  <p>Stop Loss: ₹{s.stop_loss}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
