// src/components/LiveSignalFeed.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const LiveSignalFeed = ({ darkMode }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "trades"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} shadow-md`}>
      <h2 className="text-xl font-semibold mb-2">📡 Live Signal Feed</h2>
      <ul className="space-y-1">
        {logs.map((log, idx) => (
          <li key={idx} className="text-sm border-b border-gray-600 pb-1">
            <b>{log.symbol}</b> | {log.strategy} | {log.result || 'N/A'} | ₹{log.price} | {log.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveSignalFeed;
