import React from 'react'

const timeframes = ['5min', '15min', 'daily']

const TimeframeFilters = ({ activeTimeframes, setActiveTimeframes }) => {
  const toggleTimeframe = (tf) => {
    if (activeTimeframes.includes(tf)) {
      setActiveTimeframes(activeTimeframes.filter(t => t !== tf))
    } else {
      setActiveTimeframes([...activeTimeframes, tf])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-2 pb-4">
      {timeframes.map(tf => (
        <button
          key={tf}
          onClick={() => toggleTimeframe(tf)}
          className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
            activeTimeframes.includes(tf)
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-black border-gray-400 dark:bg-gray-900 dark:text-white'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  )
}

export default TimeframeFilters
