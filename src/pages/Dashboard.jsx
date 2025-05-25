import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchSignals = async () => {
    try {
      const res = await fetch("https://v3k-backend-api.onrender.com/get-signals");
      const data = await res.json();
      setSignals(data || []);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
      setSignals([]);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 60000); // auto-refresh every 60 sec
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (filter === "all") return true;
    return signal.position_type?.toLowerCase() === filter;
  });

  return (
    <div className="p-4 min-h-screen bg-background text-foreground">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">V3k - AI Trading Bot</h1>
        <p className="text-muted-foreground text-sm">Turning signals into success</p>
      </div>

      <div className="flex justify-center mb-6">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(val) => setFilter(val || "all")}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="intraday">Intraday</ToggleGroupItem>
          <ToggleGroupItem value="swing">Swing</ToggleGroupItem>
          <ToggleGroupItem value="options">Options</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSignals.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No signals to display
          </div>
        ) : (
          filteredSignals.map((signal, idx) => (
            <Card key={idx} className="shadow-md">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">{signal.symbol}</h2>
                <p className="text-sm">Type: <strong>{signal.signal_type}</strong></p>
                <p className="text-sm">Position: <strong>{signal.position_type}</strong></p>
                <p className="text-sm text-muted-foreground">{signal.reason}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
