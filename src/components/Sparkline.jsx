import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Sparkline = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
