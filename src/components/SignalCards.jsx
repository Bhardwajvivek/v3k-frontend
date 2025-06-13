import React from "react";
import SignalCard from "./SignalCard.jsx"; // ✅ Fixed case-sensitive path

const SignalCards = ({
  signals = [],
  filter = "All",
  activeFilters = [],
  activeTimeframes = [],
  darkMode,
  onCardClick,
}) => {
  if (!Array.isArray(signals) || signals.length === 0) {
    return (
      <div className="p-4 bg-yellow-300 text-black font-semibold rounded-md text-center shadow">
        ⚠️ No signals found! Check backend or filters.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {signals.map((signal, index) =>
        signal?.symbol ? (
          <SignalCard
            key={index}
            signal={signal}
            onClick={onCardClick}
            darkMode={darkMode}
          />
        ) : null
      )}
    </div>
  );
};

export default SignalCards;
