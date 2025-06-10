/**
 * Props interface for the ChartPanel component
 */
export interface IChartPanelProps {
  /** Trading pair symbol (e.g., "btcusdt") */
  symbol?: string;
  /** Maximum number of data points to display */
  maxPoints?: number;
  /** Callback function for price updates */
  onPriceUpdate?: (price: number) => void;
}

/**
 * Interface for chart data points
 */
export interface IChartData {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Price value */
  price: number;
}

/**
 * Type definition for D3 time format function
 */
export interface ID3TimeFormat {
  (domainValue: Date | d3.NumberValue, index: number): string;
}

/**
 * Interface for individual trade data
 */
export interface ITrade {
  /** Trade price */
  price: number;
  /** Trade quantity */
  quantity: number;
  /** Unix timestamp in milliseconds */
  time: number;
}

/**
 * Interface for trade history entries
 */
export interface ITradeHistory {
  /** Unique identifier for the trade */
  id: string;
  /** Formatted time string */
  time: string;
  /** Type of trade */
  type: 'Buy' | 'Sell';
  /** Trade price */
  price: number;
  /** Trade amount */
  amount: number;
  /** Total value of the trade */
  total: number;
}

export interface IChartData {
  price: number;
  time: number;
}

/**
 * Interface for chart dimensions and margins
 */
export interface IChartDimensions {
  /** Chart width in pixels */
  width: number;
  /** Chart height in pixels */
  height: number;
  /** Chart margins */
  margin: IChartMargin;
}

/**
 * Interface for chart margins
 */
export interface IChartMargin {
  /** Top margin in pixels */
  top: number;
  /** Right margin in pixels */
  right: number;
  /** Bottom margin in pixels */
  bottom: number;
  /** Left margin in pixels */
  left: number;
}

/**
 * Interface for D3 chart scales
 */
export interface IChartScales {
  /** X-axis time scale */
  x: d3.ScaleTime<number, number>;
  /** Y-axis linear scale */
  y: d3.ScaleLinear<number, number>;
}

/**
 * Interface for D3 chart generators
 */
export interface IChartGenerators {
  /** Line generator for price line */
  line: d3.Line<IChartData>;
  /** Area generator for price area */
  area: d3.Area<IChartData>;
}

/**
 * Interface for D3 chart SVG elements
 */
export interface IChartElements {
  /** Main SVG element */
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  /** X-axis group element */
  xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Y-axis group element */
  yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Line path group element */
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Area path group element */
  areaGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Data point dots group element */
  dotGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Tooltip group element */
  tooltipGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
}

/**
 * Interface for chart state
 */
export interface IChartState {
  /** Chart dimensions and margins */
  dimensions: IChartDimensions;
  /** D3 scales */
  scales: IChartScales;
  /** D3 generators */
  generators: IChartGenerators;
  /** D3 SVG elements */
  elements: IChartElements;
}

/**
 * Props interface for the Chart component
 */
export interface IChartProps {
  /** Array of price data points */
  data: IChartData[];
  /** Callback function for price updates */
  onPriceUpdate: (price: number) => void;
}

/**
 * Interface for price point data
 */
export interface IPricePoint {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Price value */
  price: number;
}

/**
 * Interface for market data statistics
 */
export interface IMarketData {
  /** 24-hour trading volume */
  volume24h: number;
  /** Market capitalization */
  marketCap: number;
  /** 24-hour high price */
  high24h: number;
  /** 24-hour low price */
  low24h: number;
}
