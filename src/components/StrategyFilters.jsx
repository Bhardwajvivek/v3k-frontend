import React from 'react';

const strategies = ['MACD', 'RSI', 'Supertrend', 'Volume Spike', 'EMA Crossover'];

export default function StrategyFilters({ activeFilters, setActiveFilters }) {
  const toggleFilter = (strategy) => {
    if (activeFilters.includes(strategy)) {
      setActiveFilters(activeFilters.filter(s => s !== strategy));
    } else {
      setActiveFilters([...activeFilters, strategy]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {strategies.map(strategy => (
        <button
          key={strategy}
          onClick={() => toggleFilter(strategy)}
          className={`px-4 py-1 rounded-full border transition text-sm font-medium
            ${activeFilters.includes(strategy)
              ? 'bg-green-600 text-white border-green-700'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-400 dark:border-gray-600'}`}
        >
          {strategy}
        </button>
      ))}
    </div>
  );
}
