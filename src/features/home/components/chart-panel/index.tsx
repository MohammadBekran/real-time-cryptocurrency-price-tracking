"use client";

import { useEffect, useState } from "react";

import ChartContainer from "@/features/home/components/chart-panel/chart-container";
import LoadingChart from "@/features/home/components/chart-panel/loading-chart";
import { useBinanceTicker } from "@/features/home/core/hooks";
import type { IChartPanelProps } from "@/features/home/core/types";

/**
 * ChartPanel component provides a real-time cryptocurrency price chart with live updates
 * and interactive features. It integrates with Binance WebSocket API for live price data
 * and includes loading states, error handling, and decorative UI elements.
 *
 * @param {IChartPanelProps} props - Component props
 * @param {string} [props.symbol="btcusdt"] - Trading pair symbol (e.g., "btcusdt", "ethusdt")
 * @param {number} [props.maxPoints=120] - Maximum number of data points to display
 * @param {function} [props.onPriceUpdate] - Callback function triggered on price updates
 *
 * @example
 * ```tsx
 * <ChartPanel
 *   symbol="ethusdt"
 *   maxPoints={60}
 *   onPriceUpdate={(price) => console.log(price)}
 * />
 * ```
 */
const ChartPanel = ({
  symbol = "btcusdt",
  maxPoints = 120,
  onPriceUpdate,
}: IChartPanelProps) => {
  const { price, history, error } = useBinanceTicker(symbol, maxPoints);
  const [isLoading, setIsLoading] = useState(true);

  // Notify parent component of price updates
  useEffect(() => {
    if (price && onPriceUpdate) {
      onPriceUpdate(price);
    }
    // Reduce the required data points for initial load
    if (history.length > 5) setIsLoading(false);
  }, [price, onPriceUpdate, history]);

  return (
    <div className="w-full lg:h-[565px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl p-6 shadow-2xl overflow-hidden relative backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:opacity-30 before:pointer-events-none">
      {isLoading ? (
        <LoadingChart />
      ) : (
        <div className="mt-0 flex-grow relative w-full h-full">
          <ChartContainer
            dataPoint={price}
            height={540}
            width={908}
            visibleCount={maxPoints}
          />
        </div>
      )}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 text-red-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base backdrop-blur-sm border border-red-500/30 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChartPanel;
