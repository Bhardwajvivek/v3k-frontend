import { useState } from 'react'

export const PasscodeScreen = ({ onAuth }) => {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (pass === 'v3kpass') {
      onAuth()
    } else {
      setError('Invalid passcode')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-80 space-y-4 text-center">
        <h2 className="text-xl font-bold">Enter Passcode</h2>
        <input
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Enter
        </button>
      </div>
    </div>
  )
}