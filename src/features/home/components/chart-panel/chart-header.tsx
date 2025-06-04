import { animated, SpringValue } from "@react-spring/web";

import { CHART_MARGIN } from "@/features/home/core/constants";

interface IChartHeaderProps {
  symbol: string;
  isConnected: boolean;
  priceSpring: { price: SpringValue<number> };
  priceChange: number;
  priceChangeSpring: { change: SpringValue<number> };
  livePricePositionSpring: { y: SpringValue<number> };
}

const ChartHeader = ({
  symbol,
  isConnected,
  priceSpring,
  priceChange,
  priceChangeSpring,
  livePricePositionSpring,
}: IChartHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          {symbol.toUpperCase()}
        </h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm text-slate-400">
            {isConnected ? "Live" : "Demo Mode"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <animated.div className="text-3xl font-bold text-white">
          {priceSpring.price.to(
            (p: number) =>
              `$${p.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
          )}
        </animated.div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            priceChange >= 0
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          <animated.span>
            {priceChangeSpring.change.to((c: number) => (c >= 0 ? "+" : ""))}
          </animated.span>
          <animated.span>
            {priceChangeSpring.change.to((c: number) => `${c.toFixed(2)}%`)}
          </animated.span>
        </div>
        <animated.div
          id="live-price-display"
          className="absolute bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-md font-bold text-sm z-10"
          style={{
            right: `${CHART_MARGIN.right + 100}px`,
            transform: livePricePositionSpring.y.to(
              (y: number) => `translateY(${y}px)`
            ),
          }}
        >
          <span className="relative inline-flex items-center">
            <span className="relative">Live</span>
          </span>
          <div className="h-1" />
          <animated.span>
            {priceSpring.price.to((p: number) =>
              p.toLocaleString(undefined, {
                minimumFractionDigits: 5,
                maximumFractionDigits: 5,
              })
            )}
          </animated.span>
        </animated.div>
      </div>
    </div>
  );
};

export default ChartHeader;
