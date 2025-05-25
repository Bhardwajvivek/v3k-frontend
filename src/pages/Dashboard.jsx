import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch("https://v3k-backend-api.onrender.com/get-signals");
        const data = await res.json();
        setSignals(data || []);
      } catch (err) {
        console.error("Failed to fetch signals", err);
      }
    };
    fetchSignals();
  }, []);

  const filtered = signals.filter(
    (s) => filter === "all" || s.position_type?.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">V3k - AI Trading Bot</h1>
        <p className="text-gray-400">Turning signals into success</p>
      </header>

      <div className="flex justify-center gap-4 mb-6">
        {["all", "intraday", "swing", "options"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === type
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">Loading signals...</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((signal, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded-xl shadow hover:ring-2 hover:ring-green-500">
              <h2 className="text-xl font-semibold">{signal.symbol}</h2>
              <p className="text-sm">Type: {signal.type}</p>
              <p className="text-sm">Position: {signal.position_type}</p>
              <p className="text-sm text-gray-400">{signal.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
