import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

const PASSCODE = "v3k@123";

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  const chartSymbol = selectedSymbol ? `NSE:${selectedSymbol.toUpperCase()}` : null;

  useEffect(() => {
    if (!accessGranted) return;
    const fetchSignals = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-signals`);
        const json = await res.json();
        setSignals(json || []);
      } catch (err) {
        console.error("Failed to fetch signals", err);
        setSignals([]);
      }
    };
    fetchSignals();
  }, [accessGranted]);

  const filtered = signals.filter(
    (s) => filter === "all" || s.position_type?.toLowerCase() === filter.toLowerCase()
  );

  if (!accessGranted) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="p-6 bg-gray-900 rounded-xl shadow-lg w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Enter Passcode</h1>
          <input
            type="password"
            value={enteredPasscode}
            onChange={(e) => setEnteredPasscode(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
            placeholder="Passcode"
          />
          <button
            onClick={() => setAccessGranted(enteredPasscode === PASSCODE)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white w-full"
          >
            Access Dashboard
          </button>
          {enteredPasscode && enteredPasscode !== PASSCODE && (
            <p className="mt-2 text-red-500 text-sm">Incorrect passcode</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">V3k - AI Trading Bot</h1>
        <p className="text-gray-400">Turning signals into success</p>
      </header>

      <div className="flex justify-center gap-4 mb-6">
        {["all", "intraday", "swing", "options"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === type
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">No signals available...</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((signal, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-4 rounded-xl shadow hover:ring-2 hover:ring-green-500 cursor-pointer"
              onClick={() => setSelectedSymbol(signal.symbol)}
            >
              <h2 className="text-xl font-semibold">{signal.symbol}</h2>
              <p className="text-sm">Type: {signal.type}</p>
              <p className="text-sm">Position: {signal.position_type}</p>
              <p className="text-sm text-gray-400">{signal.reason}</p>
              <p className="text-sm mt-2">Entry: ₹{signal.price}</p>
              <p className="text-sm">Target: ₹{signal.target}</p>
              <p className="text-sm">Stop Loss: ₹{signal.stop_loss}</p>
              <p className="text-sm">Confidence: {signal.confidence}%</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedSymbol} onOpenChange={() => setSelectedSymbol(null)}>
        <DialogContent className="w-full h-[500px] p-0 bg-black rounded-lg shadow-xl">
          {chartSymbol && (
            <iframe
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${chartSymbol}&symbol=${chartSymbol}&interval=15&hide_side_toolbar=false&theme=dark&style=1`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency={true}
              allowFullScreen={true}
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
