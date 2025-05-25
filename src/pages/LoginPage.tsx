import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PASSCODE = "v3k2025";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("auth") === "yes") {
      navigate("/dashboard");
    }
  }, []);

  const handleLogin = () => {
    if (code === PASSCODE) {
      localStorage.setItem("auth", "yes");
      navigate("/dashboard");
    } else {
      setError("Incorrect passcode");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <img
        src="/hanuman-ram-bg.jpg"
        alt="Spiritual Background"
        className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
      />
      <div className="bg-gray-900 bg-opacity-90 p-6 rounded-xl shadow-xl w-80 text-center z-10">
        <h1 className="text-2xl font-bold mb-4 text-white">V3k Login</h1>
        <input
          type="password"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          placeholder="Enter Passcode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
