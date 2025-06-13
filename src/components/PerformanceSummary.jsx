// src/components/PerformanceSummary.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const PerformanceSummary = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/performance-report")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error loading performance report", err));
  }, []);

  const getColor = (percent) => {
    if (percent >= 80) return "text-green-500";
    if (percent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="p-4 rounded-xl shadow-xl bg-gray-800 text-white mt-4">
      <h2 className="text-xl font-bold mb-2">📊 Strategy Performance</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Strategy</th>
            <th>Win</th>
            <th>Loss</th>
            <th>Total</th>
            <th>Success %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-600">
              <td className="py-1">{row.strategy}</td>
              <td className="text-green-400">{row.Win || 0}</td>
              <td className="text-red-400">{row.Loss || 0}</td>
              <td>{row.Total || 0}</td>
              <td className={`${getColor(row["Success %"])} font-bold`}>
                {row["Success %"] || 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceSummary;
