"use client";

import { useCallback, useEffect, useState } from "react";

import ChartPanel from "@/features/home/components/chart-panel";
import { useTrades } from "@/features/home/core/hooks";

/**
 * Home component serves as the main trading dashboard interface.
 * Features include:
 * - Real-time price chart with live updates
 * - Market overview with key statistics
 * - Order placement interface
 * - Recent trades table
 *
 * The component integrates with the Binance WebSocket API for live price updates
 * and maintains local state for trades and market data.
 *
 * @example
 * ```tsx
 * <Home />
 * ```
 */
const Home = () => {
  const { trades, marketData, addTrade, updateMarketData } = useTrades();
  const [orderAmount, setOrderAmount] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  /**
   * Handles price updates from the chart component
   * Updates the current price state and triggers market data updates
   *
   * @param {number} price - The new price value
   */
  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  /**
   * Updates market data when price changes
   * Only updates if the new price is different from current high/low
   */
  useEffect(() => {
    if (
      currentPrice &&
      currentPrice !== marketData.high24h &&
      currentPrice !== marketData.low24h
    ) {
      updateMarketData(currentPrice);
    }
  }, [currentPrice, marketData.high24h, marketData.low24h, updateMarketData]);

  /**
   * Handles order placement
   * Validates input and adds the trade to the local state
   *
   * @param {"Buy" | "Sell"} type - The type of order to place
   */
  const handlePlaceOrder = () => {
    if (!currentPrice || !orderAmount || !orderPrice) return;

    const amount = parseFloat(orderAmount);
    const price = parseFloat(orderPrice);

    if (isNaN(amount) || isNaN(price)) return;

    // In a real app, this would place an order on the exchange
    addTrade(price);
    setOrderAmount("");
    setOrderPrice("");
  };

  /**
   * Formats numbers into human-readable currency strings
   * Handles billions and millions with appropriate suffixes
   *
   * @param {number} num - The number to format
   * @returns {string} Formatted currency string
   * @example
   * formatNumber(1500000) // "$1.5M"
   * formatNumber(2500000000) // "$2.5B"
   */
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Real-time cryptocurrency price tracking
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Panel */}
          <div className="lg:col-span-2">
            <ChartPanel onPriceUpdate={handlePriceUpdate} />
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                Market Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">24h Volume</span>
                  <span className="text-white font-medium">
                    {formatNumber(marketData.volume24h)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="text-white font-medium">
                    {formatNumber(marketData.marketCap)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">24h High</span>
                  <span className="text-white font-medium">
                    {formatNumber(marketData.high24h)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">24h Low</span>
                  <span className="text-white font-medium">
                    {formatNumber(marketData.low24h)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trading Form */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Place Order</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlaceOrder()}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handlePlaceOrder()}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-4">Time</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Price</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Total</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-t border-slate-800">
                    <td className="py-3">{trade.time}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade.type === "Buy"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3">${trade.price.toLocaleString()}</td>
                    <td className="py-3">{trade.amount.toFixed(4)} BTC</td>
                    <td className="py-3">${trade.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
