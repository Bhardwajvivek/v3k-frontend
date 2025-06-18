import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // ✅ This loads your full trading dashboard
import './index.css'; // Optional: Your Tailwind or global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
