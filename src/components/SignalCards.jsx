import { useEffect, useState } from 'react'

export const SignalCards = ({ filter, activeFilters, activeTimeframes, onSignalClick }) => {
  const [signals, setSignals] = useState([])

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/get-signals')
        const data = await res.json()
        setSignals(data.signals || [])  // ✅ FIXED
      } catch (err) {
        console.error('Error fetching signals:', err)
      }
    }

    fetchSignals()
    const interval = setInterval(fetchSignals, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = signals; // TEMP: disable all filters

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.length === 0 ? (
        <div className="text-center col-span-full text-gray-500 dark:text-gray-400">
          No signals found for selected filters.
        </div>
      ) : (
        filtered.map((sig, idx) => {
          const isWatchlist = sig.type === 'Watchlist'
          const cardClass = `cursor-pointer rounded-2xl border p-4 shadow-md transition ${
            isWatchlist
              ? 'bg-yellow-100 text-black dark:bg-yellow-200'
              : 'bg-white dark:bg-gray-800 text-black dark:text-white'
          } hover:scale-105`

          return (
            <div key={idx} onClick={() => onSignalClick(sig)} className={cardClass}>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-bold">{sig.symbol}</h2>
                {isWatchlist && (
                  <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-semibold">
                    👀 Watchlist
                  </span>
                )}
              </div>
              <p className="text-sm opacity-70">{sig.strategy}</p>
              <div className="mt-2 text-sm">
                <span className="font-semibold">Timeframe:</span> {sig.timeframe}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Type:</span> {sig.type}
              </div>
              <div className="mt-2 font-semibold text-green-500 dark:text-green-400">₹ {sig.price}</div>
              <div className="text-xs mt-1 text-yellow-600">Signal Strength: {sig.strength}%</div>
            </div>
          )
        })
      )}
    </div>
  )
}
