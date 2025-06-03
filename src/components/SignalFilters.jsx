const filterTabs = ['All', 'Intraday', 'Swing', 'Options Only']

export const SignalFilters = ({ selected, setSelected }) => {
  return (
    <div className="flex justify-center space-x-3 my-4">
      {filterTabs.map(tab => (
        <button
          key={tab}
          onClick={() => setSelected(tab)}
          className={`px-4 py-2 rounded-full border ${
            selected === tab
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent dark:text-white text-black border-gray-400'
          } hover:scale-105 transition`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}