import { animated, SpringValue } from "@react-spring/web";

interface IChartHeaderProps {
  symbol: string;
  isConnected: boolean;
  priceSpring: { price: SpringValue<number> };
  priceChange: number;
  priceChangeSpring: { change: SpringValue<number> };
}

/**
 * ChartHeader component displays the trading pair information, connection status,
 * current price, and price change percentage with smooth animations.
 *
 * @param {IChartHeaderProps} props - Component props
 * @param {string} props.symbol - Trading pair symbol (e.g., "btcusdt")
 * @param {boolean} props.isConnected - WebSocket connection status
 * @param {{ price: SpringValue<number> }} props.priceSpring - Animated price value using react-spring
 * @param {number} props.priceChange - Current price change percentage
 * @param {{ change: SpringValue<number> }} props.priceChangeSpring - Animated price change value using react-spring
 *
 * @example
 * ```tsx
 * <ChartHeader
 *   symbol="btcusdt"
 *   isConnected={true}
 *   priceSpring={{ price: animated(50000) }}
 *   priceChange={2.5}
 *   priceChangeSpring={{ change: animated(2.5) }}
 * />
 * ```
 */
const ChartHeader = ({
  symbol,
  isConnected,
  priceSpring,
  priceChange,
  priceChangeSpring,
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
                minimumFractionDigits: 5,
                maximumFractionDigits: 5,
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
      </div>
    </div>
  );
};

export default ChartHeader;
