export interface IChartPanelProps {
  symbol?: string;
  maxPoints?: number;
  onPriceUpdate?: (price: number) => void;
}

export interface IChartData {
  time: number;
  price: number;
}

export interface ID3TimeFormat {
  (domainValue: Date | d3.NumberValue, index: number): string;
}

export interface ITrade {
  price: number;
  quantity: number;
  time: number;
}

export interface ITradeHistory {
  id: string;
  time: string;
  type: "Buy" | "Sell";
  price: number;
  amount: number;
  total: number;
}

export interface IChartData {
  price: number;
  time: number;
}

export interface IChartDimensions {
  width: number;
  height: number;
  margin: IChartMargin;
}

export interface IChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IChartScales {
  x: d3.ScaleTime<number, number>;
  y: d3.ScaleLinear<number, number>;
}

export interface IChartGenerators {
  line: d3.Line<IChartData>;
  area: d3.Area<IChartData>;
}

export interface IChartElements {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  areaGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  dotGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  tooltipGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
}

export interface IChartState {
  dimensions: IChartDimensions;
  scales: IChartScales;
  generators: IChartGenerators;
  elements: IChartElements;
}

export interface IChartProps {
  data: IChartData[];
  onPriceUpdate: (price: number) => void;
}

export interface IPricePoint {
  time: number;
  price: number;
}

export interface IMarketData {
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}
