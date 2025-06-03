import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { SignalFilters } from './components/SignalFilters'
import { SignalCards } from './components/SignalCards'
import ChartModal from './components/ChartModal'
import { IndexFlashes } from './components/IndexFlashes'
import { PasscodeScreen } from './components/PasscodeScreen'
import StrategyFilters from './components/StrategyFilters'
import TimeframeFilters from './components/TimeframeFilters'

const mockSignals = [
  {
    symbol: "RELIANCE.NS",
    strategy: "MACD + RSI",
    strategyTags: ["MACD", "RSI"],
    timeframe: "15m",
    type: "Intraday",
    price: 2500,
    strength: 90
  }
];

function App() {
  // State management - using React state instead of localStorage
  const [darkMode, setDarkMode] = useState(true) // Default to dark mode
  const [authenticated, setAuthenticated] = useState(false) // Default to not authenticated
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [filter, setFilter] = useState('Intraday') // Match type in mockSignals // Type: Intraday, Swing, Watchlist
  const [activeFilters, setActiveFilters] = useState(["MACD", "RSI"]) // Strategy filters: MACD, RSI...
  const [activeTimeframes, setActiveTimeframes] = useState(["15m"]) // 5min, 15min, daily...
  const [signals, setSignals] = useState(mockSignals);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Signal click handler
  const handleSignalClick = (signal) => {
    if (signal) {
      setSelectedSignal(signal)
    }
  }

  // Close modal handler
  const handleCloseModal = () => {
    setSelectedSignal(null)
  }

  // Authentication handler
  const handleAuthentication = () => {
    setAuthenticated(true)
  }

  // Logout handler
  const handleLogout = () => {
    setAuthenticated(false)
    // Clear other sensitive data if needed
    setSelectedSignal(null)
    setSignals([])
  }

  // Error handler
  const handleError = (errorMessage) => {
    setError(errorMessage)
    setIsLoading(false)
  }

  // Clear error handler
  const clearError = () => {
    setError(null)
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {!authenticated ? (
        <PasscodeScreen 
          onAuth={handleAuthentication}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      ) : (
        <>
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            onLogout={handleLogout}
          />
          
          <IndexFlashes darkMode={darkMode} />

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-red-700 dark:text-red-200">{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
                  aria-label="Clear error"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Signal Type: Intraday, Swing, Watchlist */}
          <SignalFilters 
            selected={filter} 
            setSelected={setFilter}
            darkMode={darkMode}
          />

          {/* Strategy Filter: MACD, RSI, etc. */}
          <StrategyFilters 
            activeFilters={activeFilters} 
            setActiveFilters={setActiveFilters}
            darkMode={darkMode}
          />

          {/* Timeframe Filter: 5min, 15min, Daily */}
          <TimeframeFilters 
            activeTimeframes={activeTimeframes} 
            setActiveTimeframes={setActiveTimeframes}
            darkMode={darkMode}
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading signals...</span>
            </div>
          )}

          {/* Signal Cards with all filters */}
          <SignalCards
            filter={filter}
            activeFilters={activeFilters}
            activeTimeframes={activeTimeframes}
            signals={signals}
            setSignals={setSignals}
            onSignalClick={handleSignalClick}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onError={handleError}
            darkMode={darkMode}
          />

          {/* Chart Modal */}
          {selectedSignal && (
            <ChartModal 
              signal={selectedSignal} 
              onClose={handleCloseModal}
              darkMode={darkMode}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App