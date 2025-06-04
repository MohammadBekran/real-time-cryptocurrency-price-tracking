"use client";

import { useSpring } from "@react-spring/web";
import { useEffect, useRef } from "react";

import ChartContainer from "@/features/home/components/chart-panel/chart-container";
import ChartHeader from "@/features/home/components/chart-panel/chart-header";
import { useBinanceTicker } from "@/features/home/core/hooks";
import type { IChartPanelProps } from "@/features/home/core/types";
import { createScales } from "@/features/home/core/utils";

const ChartPanel = ({
  symbol = "btcusdt",
  maxPoints = 120,
  onPriceUpdate,
}: IChartPanelProps) => {
  const { price, history, isConnected, error } = useBinanceTicker(
    symbol,
    maxPoints
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring animation for price
  const priceSpring = useSpring({
    from: { price: 0 },
    to: { price: price || 0 },
    config: { tension: 300, friction: 30 },
  });

  // Notify parent component of price updates
  useEffect(() => {
    if (price && onPriceUpdate) {
      onPriceUpdate(price);
    }
  }, [price, onPriceUpdate]);

  // Calculate price change
  const priceChange =
    history.length > 1
      ? ((history[history.length - 1].price - history[0].price) /
          history[0].price) *
        100
      : 0;

  // Spring animation for price change
  const priceChangeSpring = useSpring({
    from: { change: 0 },
    to: { change: priceChange },
    config: { tension: 300, friction: 30 },
  });

  // Spring animation for live price display position
  const livePricePositionSpring = useSpring({
    from: { y: 0 },
    to: async (next) => {
      if (!history || history.length < 2 || !containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const lastPoint = history[history.length - 1];
      const { yScale } = createScales(history, width, height, priceChange);

      const livePriceY = yScale(lastPoint.price);
      const livePriceElement = document.getElementById("live-price-display");
      const livePriceElementHeight = livePriceElement
        ? livePriceElement.clientHeight
        : 0;
      const finalY = livePriceY - livePriceElementHeight / 2;

      await next({ y: finalY });
    },
    config: { tension: 300, friction: 30 },
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] bg-slate-900 rounded-xl p-6 shadow-xl overflow-hidden"
    >
      <ChartHeader
        symbol={symbol}
        isConnected={isConnected}
        priceSpring={priceSpring}
        priceChange={priceChange}
        priceChangeSpring={priceChangeSpring}
        livePricePositionSpring={livePricePositionSpring}
      />
      <ChartContainer history={history} priceChange={priceChange} />
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 text-red-500 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChartPanel;
