/**
 * Core type definitions for the trading chart feature
 * Defines interfaces for chart components, data structures, and D3.js integrations
 */

/**
 * ChartPanel component props
 * Controls the behavior and appearance of the main chart panel
 */
export interface IChartPanelProps {
  /** Trading pair symbol in lowercase (e.g., "btcusdt") */
  symbol?: string;
  /** Maximum number of data points to display in the chart */
  maxPoints?: number;
  /** Callback triggered when price updates occur */
  onPriceUpdate?: (price: number) => void;
}

/**
 * Represents a single data point in the price chart
 * Used for both real-time and historical price data
 */
export interface IChartData {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Current price value at the given timestamp */
  price: number;
}

/**
 * D3 time format function type
 * Used for formatting timestamps in the chart axes and tooltips
 */
export interface ID3TimeFormat {
  (domainValue: Date | d3.NumberValue, index: number): string;
}

/**
 * Individual trade data structure
 * Represents a single trade execution in the market
 */
export interface ITrade {
  /** Execution price of the trade */
  price: number;
  /** Volume of the trade */
  quantity: number;
  /** Unix timestamp of trade execution */
  time: number;
}

/**
 * Trade history entry with formatted data
 * Used for displaying trade information in the UI
 */
export interface ITradeHistory {
  /** Unique identifier for the trade record */
  id: string;
  /** Human-readable time string */
  time: string;
  /** Trade direction */
  type: 'Buy' | 'Sell';
  /** Execution price */
  price: number;
  /** Trade volume */
  amount: number;
  /** Total value (price * amount) */
  total: number;
}

/**
 * Chart dimensions and layout configuration
 * Defines the spatial properties of the chart
 */
export interface IChartDimensions {
  /** Total width of the chart container */
  width: number;
  /** Total height of the chart container */
  height: number;
  /** Spacing around the chart content */
  margin: IChartMargin;
}

/**
 * Chart margin configuration
 * Controls the spacing between chart content and container edges
 */
export interface IChartMargin {
  /** Space above the chart content */
  top: number;
  /** Space to the right of the chart content */
  right: number;
  /** Space below the chart content */
  bottom: number;
  /** Space to the left of the chart content */
  left: number;
}

/**
 * D3 scale configurations
 * Defines the mapping between data and visual coordinates
 */
export interface IChartScales {
  /** Time-based scale for x-axis */
  x: d3.ScaleTime<number, number>;
  /** Linear scale for y-axis */
  y: d3.ScaleLinear<number, number>;
}

/**
 * D3 path generators
 * Creates SVG paths for chart elements
 */
export interface IChartGenerators {
  /** Generator for the price line path */
  line: d3.Line<IChartData>;
  /** Generator for the area fill path */
  area: d3.Area<IChartData>;
}

/**
 * D3 SVG element selections
 * References to chart DOM elements
 */
export interface IChartElements {
  /** Root SVG element */
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  /** X-axis container */
  xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Y-axis container */
  yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Price line container */
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Area fill container */
  areaGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Data points container */
  dotGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Tooltip container */
  tooltipGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
}

/**
 * Chart state management
 * Maintains the current state of chart elements and data
 */
export interface IChartState {
  /** Current chart dimensions */
  dimensions: IChartDimensions;
  /** Active D3 scales */
  scales: IChartScales;
  /** Active D3 generators */
  generators: IChartGenerators;
  /** Active D3 element selections */
  elements: IChartElements;
}

/**
 * Chart component props
 * Controls the chart's data and behavior
 */
export interface IChartProps {
  /** Array of price data points to display */
  data: IChartData[];
  /** Callback for price update events */
  onPriceUpdate: (price: number) => void;
}

/**
 * Price point data structure
 * Represents a single price update
 */
export interface IPricePoint {
  /** Unix timestamp of the price update */
  time: number;
  /** Updated price value */
  price: number;
}

/**
 * Market statistics
 * Contains key market metrics and indicators
 */
export interface IMarketData {
  /** 24-hour trading volume in base currency */
  volume24h: number;
  /** Total market capitalization */
  marketCap: number;
  /** Highest price in the last 24 hours */
  high24h: number;
  /** Lowest price in the last 24 hours */
  low24h: number;
}

/**
 * D3 line chart configuration
 * Parameters for the line chart visualization
 */
export interface ID3LineChartParams {
  /** Main chart group reference */
  gRef: React.RefObject<SVGGElement | null>;
  /** Line path reference */
  pathRef: React.RefObject<SVGPathElement | null>;
  /** Data points array */
  data: number[];
  /** X-axis scale reference */
  xScale: React.RefObject<d3.ScaleLinear<number, number>>;
  /** Y-axis scale reference */
  yScale: React.RefObject<d3.ScaleLinear<number, number>>;
  /** Line generator reference */
  lineGenerator: React.RefObject<d3.Line<number>>;
  /** Interactive dot radius */
  circleRadius: number;
  /** Line and dot stroke width */
  strokeWidth: number;
}

/**
 * Chart builder hook parameters
 * Configuration for chart initialization and updates
 */
export interface IChartBuilderParams {
  /** Main chart group reference */
  GRef: React.RefObject<SVGGElement>;
  /** Line path reference */
  pathRef: React.RefObject<SVGPathElement>;
  /** Price card reference */
  priceCardRef: React.RefObject<SVGGElement>;
  /** X-axis group reference */
  xAxisG: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  /** Y-axis group reference */
  yAxisG: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  /** X-axis scale reference */
  xScale: React.RefObject<d3.ScaleLinear<number, number>>;
  /** Y-axis scale reference */
  yScale: React.RefObject<d3.ScaleLinear<number, number>>;
  /** Line generator reference */
  lineGenerator: React.RefObject<d3.Line<number>>;
  /** Chart dimensions */
  dimensions: { width: number; height: number };
  /** Chart content width */
  innerWidth: number;
  /** Chart content height */
  innerHeight: number;
  /** Text size */
  fontSize: number;
  /** Line thickness */
  strokeWidth: number;
  /** Interactive dot size */
  circleRadius: number;
  /** Current price value */
  dataPoint: number | null;
  /** Visible data points count */
  visibleCount: number;
  /** Scale update handler */
  updateScales: (data: number[]) => void;
  /** Axis update handler */
  updateAxes: () => void;
  /** Price card update handler */
  updatePriceCard: () => void;
  /** Animation cycle handler */
  runAnimationCycle: () => void;
}

/**
 * Binance ticker hook parameters
 * Configuration for real-time price updates
 */
export interface IBinanceTickerParams {
  /** Trading pair symbol */
  symbol?: string;
  /** Historical data limit */
  maxPoints?: number;
}

/**
 * Binance ticker hook result
 * Real-time price data and connection status
 */
export interface IBinanceTickerResult {
  /** Current market price */
  price: number | null;
  /** Price history array */
  history: IPricePoint[];
  /** WebSocket connection status */
  isConnected: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Trades hook result
 * Trade history and market data management
 */
export interface ITradesResult {
  /** Recent trades array */
  trades: ITradeHistory[];
  /** Current market statistics */
  marketData: IMarketData;
  /** Trade addition handler */
  addTrade: (price: number) => void;
  /** Market data update handler */
  updateMarketData: (price: number) => void;
}
