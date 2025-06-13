import React, { useEffect, useState } from "react";
import axios from "axios";

const StrategyPerformancePanel = ({ darkMode }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axios.get(`${apiUrl}/strategy-accuracy-report`);
        // ✅ Ensure it's a valid array
        const result = Array.isArray(response.data) ? response.data : [];
        setPerformanceData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch strategy accuracy report");
        setPerformanceData([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [apiUrl]);

  if (loading)
    return (
      <div className="text-center text-sm py-2">
        📊 Loading strategy performance...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 py-2 font-semibold">
        {error}
      </div>
    );

  return (
    <div
      className={`rounded-xl shadow-md p-4 text-sm mt-6 overflow-auto ${
        darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="text-lg font-bold mb-3">Strategy Accuracy Report</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-2 py-1">Strategy</th>
            <th className="px-2 py-1">Timeframe</th>
            <th className="px-2 py-1">Total</th>
            <th className="px-2 py-1 text-green-500">Win</th>
            <th className="px-2 py-1 text-red-500">Loss</th>
            <th className="px-2 py-1">Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(performanceData) ? performanceData : []).map(
            (item, index) => (
              <tr key={index} className="border-b">
                <td className="px-2 py-1">{item.strategy || "N/A"}</td>
                <td className="px-2 py-1">{item.timeframe || "N/A"}</td>
                <td className="px-2 py-1">{item.total || 0}</td>
                <td className="px-2 py-1 text-green-500">{item.win || 0}</td>
                <td className="px-2 py-1 text-red-500">{item.loss || 0}</td>
                <td className="px-2 py-1">{item.accuracy || 0}%</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StrategyPerformancePanel;
