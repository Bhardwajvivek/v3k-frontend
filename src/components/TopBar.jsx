import React from 'react';

const TopBar = ({ darkMode, setDarkMode }) => {
  return (
    <header className="h-[60px] w-full sticky top-0 z-50 flex items-center justify-between px-4 border-b border-gray-700 bg-[#12151c] shadow-md">
      <div className="flex items-center gap-2">
        <div className="text-xl font-extrabold tracking-wide text-gradient bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          V3k - AI Trading Bot
        </div>
        <span className="text-xs text-gray-400 italic ml-2">Turning signals into success</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
        >
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
