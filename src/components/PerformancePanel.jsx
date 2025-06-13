import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PerformancePanel = ({ darkMode }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = 'http://127.0.0.1:5000/performance-report';

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await axios.get(apiUrl);
        // ✅ Ensure only valid array is accepted
        const result = Array.isArray(res.data) ? res.data : [];
        setData(result);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setData([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  return (
    <div className={`rounded-xl shadow-md p-4 mt-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-xl font-bold mb-3">📊 Strategy Performance Report</h2>

      {loading ? (
        <div className="text-sm text-gray-400">Loading performance data...</div>
      ) : !Array.isArray(data) || data.length === 0 ? (
        <div className="text-sm text-red-400">No trade data found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700">
            <thead>
              <tr className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} text-xs uppercase`}>
                <th className="px-4 py-2">Strategy</th>
                <th className="px-4 py-2 text-green-400">WIN</th>
                <th className="px-4 py-2 text-red-400">LOSS</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Accuracy (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-700">
                  <td className="px-4 py-2 font-medium">{row.strategy || 'N/A'}</td>
                  <td className="px-4 py-2 text-green-300">{row.WIN || 0}</td>
                  <td className="px-4 py-2 text-red-300">{row.LOSS || 0}</td>
                  <td className="px-4 py-2">{row.total || 0}</td>
                  <td className="px-4 py-2 font-semibold">{row.accuracy || 0} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;
