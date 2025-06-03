import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./ui/dialog"; // ✅ Fixed relative path manually
import { X, ExternalLink, Clock } from "lucide-react";

const ChartModal = ({ signal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (signal?.symbol) {
      const sym = signal.symbol.replace(".NS", "");
      const tvURL = `https://in.tradingview.com/symbols/NSE-${sym}/`;
      setUrl(tvURL);
    }
  }, [signal]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-gray-900 text-white px-3 py-1 rounded-md hover:bg-gray-800 text-sm"
          onClick={() => setIsOpen(true)}
        >
          View Chart
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-lg">
            {signal.symbol} ({signal.timeframe}) - {signal.strategy}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink size={18} />
              View on TradingView
            </a>
            <Clock size={18} className="opacity-60" />
            <X onClick={() => setIsOpen(false)} className="cursor-pointer" />
          </div>
        </DialogHeader>
        <div className="w-full h-[500px]">
          <iframe
            src={`https://in.tradingview.com/widgetembed/?symbol=NSE:${signal.symbol.replace(
              ".NS",
              ""
            )}&interval=${signal.timeframe}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&theme=dark&style=1&timezone=Asia/Kolkata&withdateranges=1&hideideas=1`}
            frameBorder="0"
            allowTransparency="true"
            scrolling="no"
            allowFullScreen
            title="Chart"
            className="w-full h-full"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;
