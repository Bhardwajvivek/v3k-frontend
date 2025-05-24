function SignalCard({ symbol, type, price, strategy, timeframe }) {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-1">{symbol}</h2>
      <p className={`text-${type === "Buy" ? "green" : "red"}-600 font-semibold`}>
        {type} @ ₹{price}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">{strategy}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{timeframe}</p>
    </div>
  );
}

export default SignalCard;
