import { Moon, Sun } from 'lucide-react'

export const Header = ({ darkMode, setDarkMode }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md dark:bg-gray-900 bg-gray-100">
      <div>
        <h1 className="text-3xl font-bold">V3k - AI Trading Bot</h1>
        <p className="text-sm opacity-70">Turning signals into success</p>
      </div>
      <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-800 transition">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  )
}