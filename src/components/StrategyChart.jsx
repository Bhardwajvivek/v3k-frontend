import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const StrategyChart = ({ darkMode }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/performance-report');
        const transformed = res.data.map(item => {
          const win = item.WIN || 0;
          const loss = item.LOSS || 0;
          const total = win + loss;
          const accuracy = total > 0 ? ((win / total) * 100).toFixed(1) : 0;
          return {
            strategy: item.strategy,
            WIN: win,
            LOSS: loss,
            Accuracy: parseFloat(accuracy),
          };
        });
        setChartData(transformed);
        setLoading(false);
      } catch (err) {
        setError('Failed to load performance chart');
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <p className="text-sm p-2">Loading chart...</p>;
  if (error) return <p className="text-sm text-red-500 p-2">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">📊 Strategy Win/Loss Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="strategy" stroke={darkMode ? '#fff' : '#000'} />
          <YAxis stroke={darkMode ? '#fff' : '#000'} />
          <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', color: darkMode ? '#fff' : '#000' }} />
          <Legend />
          <Bar dataKey="WIN" fill="#10b981" />
          <Bar dataKey="LOSS" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StrategyChart;
