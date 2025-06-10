'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import * as d3 from 'd3';

import type {
  IMarketData,
  IPricePoint,
  ITradeHistory,
  ID3LineChartParams,
  ITradesResult,
  IBinanceTickerResult,
  IChartBuilderParams,
} from '@/features/home/core/types';

/**
 * Custom hook for managing real-time price data from Binance
 * Provides price updates, historical data, and connection status
 * Falls back to mock data if the API is unavailable
 *
 * @param {string} [symbol="btcusdt"] - Trading pair symbol
 * @param {number} [maxPoints=120] - Maximum number of historical points to maintain
 * @returns {Object} Price data and connection status
 * @returns {number|null} returns.price - Current price
 * @returns {IPricePoint[]} returns.history - Historical price data
 * @returns {boolean} returns.isConnected - WebSocket connection status
 * @returns {object} returns.error - Error message if any
 *
 * @example
 * ```tsx
 * const { price, history, isConnected, error } = useBinanceTicker("btcusdt", 120);
 * ```
 */
export const useBinanceTicker = (
  symbol: string = 'btcusdt',
  maxPoints: number = 120
): IBinanceTickerResult => {
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<IPricePoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generates and updates mock price data
   * Used as a fallback when the WebSocket connection fails
   *
   * @param {number} initialPrice - Starting price for mock data
   */
  const startMockData = useCallback(
    (initialPrice: number) => {
      let mockPrice = initialPrice;
      let mockTime = Date.now();

      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }

      mockIntervalRef.current = setInterval(() => {
        // Generate realistic price movements
        const change = (Math.random() - 0.5) * (mockPrice * 0.001); // 0.1% max change
        mockPrice += change;
        mockTime += 1000;

        setPrice(mockPrice);
        setHistory((prev) => {
          const next = [...prev, { time: mockTime, price: mockPrice }];
          return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
        });
      }, 1000);
    },
    [maxPoints]
  );

  useEffect(() => {
    let mounted = true;
    const ws = wsRef.current;
    const reconnectTimeout = reconnectTimeoutRef.current;

    /**
     * Fetches the initial price from Binance REST API
     * Falls back to a default price if the API call fails
     *
     * @returns {Promise<number>} Initial price value
     */
    const getInitialPrice = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`
        );
        const data = await response.json();
        const initialPrice = parseFloat(data.price);

        if (mounted) {
          setPrice(initialPrice);
          setHistory([{ time: Date.now(), price: initialPrice }]);
        }

        return initialPrice;
      } catch (err) {
        console.error('Error fetching initial price:', err);
        return 50000; // Fallback price
      }
    };

    const initialize = async () => {
      try {
        // Get initial price
        const initialPrice = await getInitialPrice();
        if (!mounted) return;

        // Start mock data with initial price
        startMockData(initialPrice);
        setIsConnected(true);
      } catch (err) {
        console.error('Error initializing:', err);
        if (mounted) {
          setError('Failed to initialize');
          // Start mock data with fallback price
          startMockData(50000);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [symbol, startMockData]);

  return { price, history, isConnected, error };
};

/**
 * Custom hook for managing trades and market data
 * Provides functionality for adding trades and updating market statistics
 *
 * @returns {Object} Trades and market data management functions
 * @returns {ITradeHistory[]} returns.trades - List of recent trades
 * @returns {IMarketData} returns.marketData - Current market statistics
 * @returns {Function} returns.addTrade - Function to add a new trade
 * @returns {Function} returns.updateMarketData - Function to update market data
 *
 * @example
 * ```tsx
 * const { trades, marketData, addTrade, updateMarketData } = useTrades();
 * ```
 */
export const useTrades = (): ITradesResult => {
  const [trades, setTrades] = useState<ITradeHistory[]>([]);
  const [marketData, setMarketData] = useState<IMarketData>({
    volume24h: 1.2e9,
    marketCap: 45.8e9,
    high24h: 52450,
    low24h: 48920,
  });

  /**
   * Generates a random trade with realistic values
   *
   * @param {number} price - Current price for the trade
   * @returns {ITradeHistory} Generated trade object
   */
  const generateTrade = useCallback((price: number): ITradeHistory => {
    const type = Math.random() > 0.5 ? 'Buy' : 'Sell';
    const amount = Number((Math.random() * 0.5).toFixed(4));
    const total = Number((amount * price).toFixed(2));
    const now = new Date();
    const time = now.toLocaleTimeString();

    return {
      id: Math.random().toString(36).substr(2, 9),
      time,
      type,
      price,
      amount,
      total,
    };
  }, []);

  /**
   * Adds a new trade to the history
   * Maintains a maximum of 10 recent trades
   *
   * @param {number} price - Price of the new trade
   */
  const addTrade = useCallback(
    (price: number) => {
      const newTrade = generateTrade(price);
      setTrades((prev) => [newTrade, ...prev].slice(0, 10));
    },
    [generateTrade]
  );

  /**
   * Updates market data based on new price
   * Only updates if the price change is significant (>0.1%)
   *
   * @param {number} price - New price to update market data with
   */
  const updateMarketData = useCallback((price: number) => {
    setMarketData((prev) => {
      // Only update if the price is significantly different
      const shouldUpdate = price > prev.high24h * 1.001 || price < prev.low24h * 0.999;

      if (!shouldUpdate) return prev;

      return {
        volume24h: prev.volume24h * (1 + (Math.random() - 0.5) * 0.01),
        marketCap: prev.marketCap * (1 + (Math.random() - 0.5) * 0.005),
        high24h: Math.max(prev.high24h, price),
        low24h: Math.min(prev.low24h, price),
      };
    });
  }, []);

  return {
    trades,
    marketData,
    addTrade,
    updateMarketData,
  };
};

/**
 * useD3LineChart - Custom React hook for rendering and updating a D3 line chart with a shiny dot at the latest data point.
 *
 * @param {Object} params - Hook parameters
 * @param {React.RefObject<SVGGElement>} params.gRef - Ref to the main <g> group element
 * @param {React.RefObject<SVGPathElement>} params.pathRef - Ref to the line <path> element
 * @param {number[]} params.data - Array of numeric data points
 * @param {d3.ScaleLinear<number, number>} params.xScale - D3 x scale
 * @param {d3.ScaleLinear<number, number>} params.yScale - D3 y scale
 * @param {d3.Line<number>} params.lineGenerator - D3 line generator
 * @param {number} params.circleRadius - Radius for the shiny dot
 * @param {number} params.strokeWidth - Stroke width for the line and dot
 */
export function useD3LineChart({
  gRef,
  pathRef,
  data,
  xScale,
  yScale,
  lineGenerator,
  circleRadius,
  strokeWidth,
}: ID3LineChartParams) {
  // Main effect: update the line path and draw the shiny dot whenever data or scales change
  // This keeps the chart in sync with React state/props
  React.useEffect(() => {
    if (
      !gRef.current ||
      !pathRef.current ||
      !Array.isArray(data) ||
      data.length === 0 ||
      !xScale.current ||
      !yScale.current ||
      !lineGenerator.current
    )
      return;
    // Update the line path
    d3.select(pathRef.current).datum(data).attr('d', lineGenerator.current);
    // Draw the shiny dot at the latest data point
    const group = d3.select(gRef.current).select('g[clip-path]');
    const lastIndex = data.length - 1;
    const lastValue = data[lastIndex];
    let cx = xScale.current(lastIndex);
    const maxX = xScale.current.range()[1];
    if (cx > maxX - 2 * circleRadius) cx = maxX - 2 * circleRadius;
    const cy = yScale.current(lastValue);
    const dotY = cy - circleRadius * 2;

    // Remove existing dots if they exist
    const existingDots = group.selectAll(
      '.shiny-dot, .shiny-dot-halo, .shiny-dot-halo2, .shiny-dot-ring'
    );
    if (existingDots.empty()) {
      // Create new dots if they don't exist
      group
        .append('circle')
        .attr('class', 'shiny-dot-halo2')
        .attr('cx', cx)
        .attr('cy', dotY)
        .attr('r', circleRadius * 3.2)
        .attr('fill', 'url(#lineGradient)')
        .attr('opacity', 0.13)
        .attr('filter', 'url(#glow)');
      // White halo
      group
        .append('circle')
        .attr('class', 'shiny-dot-halo')
        .attr('cx', cx)
        .attr('cy', dotY)
        .attr('r', circleRadius * 2.2)
        .attr('fill', 'white')
        .attr('opacity', 0.22)
        .attr('filter', 'url(#glow)');
      // Subtle colored ring
      group
        .append('circle')
        .attr('class', 'shiny-dot-ring')
        .attr('cx', cx)
        .attr('cy', dotY)
        .attr('r', circleRadius * 1.7)
        .attr('fill', 'none')
        .attr('stroke', 'url(#lineGradient)')
        .attr('stroke-width', strokeWidth * 1.1)
        .attr('opacity', 0.7)
        .attr('filter', 'url(#glow)');
      // Main shiny dot
      group
        .append('circle')
        .attr('class', 'shiny-dot')
        .attr('cx', cx)
        .attr('cy', dotY)
        .attr('r', circleRadius * 1.15)
        .attr('fill', 'white')
        .attr('stroke', 'url(#lineGradient)')
        .attr('stroke-width', strokeWidth * 1.3)
        .attr('filter', 'url(#glow)');
    } else {
      // Update existing dots with transition
      existingDots.transition().duration(500).ease(d3.easeLinear).attr('cx', cx).attr('cy', dotY);
    }
  }, [gRef, pathRef, data, xScale, yScale, lineGenerator, circleRadius, strokeWidth]);
}

/**
 * Custom hook for initializing and managing the D3 chart elements and animations
 */
export function useChartBuilder({
  GRef,
  pathRef,
  priceCardRef,
  xAxisG,
  yAxisG,
  xScale,
  yScale,
  lineGenerator,
  dimensions,
  innerWidth,
  innerHeight,
  fontSize,
  dataPoint,
  visibleCount,
  updateScales,
  updateAxes,
  updatePriceCard,
  runAnimationCycle,
}: IChartBuilderParams) {
  const dataQueue = useRef<number[]>([]);
  const isAnimating = useRef(false);
  const isInitialized = useRef(false);
  const [chartData, setChartData] = useState<number[]>([]);

  // Initialize chart elements
  useEffect(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0 || !GRef.current) return;

    const group = d3.select(GRef.current);
    group.selectAll('.axis').remove();

    yAxisG.current = group.append('g').attr('class', 'axis axis--y');
    xAxisG.current = group
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${innerHeight})`);

    xScale.current.range([0, innerWidth]);
    yScale.current.range([innerHeight, 0]);

    xAxisG.current.call(d3.axisBottom(xScale.current));

    group.selectAll('.price-card').remove();
    const priceCard = group
      .append('g')
      .attr('class', 'price-card')
      .attr('transform', `translate(${innerWidth + 30}, 0)`);
    priceCard
      .append('rect')
      .attr('width', Math.max(60, dimensions.width * 0.08))
      .attr('height', Math.max(20, dimensions.height * 0.05))
      .attr('rx', 6)
      .attr('fill', 'rgba(15, 23, 42, 0.8)')
      .attr('stroke', 'rgba(59, 130, 246, 0.3)')
      .attr('stroke-width', '1')
      .style('filter', 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))');
    priceCard
      .append('text')
      .attr('x', Math.max(30, dimensions.width * 0.04))
      .attr('y', Math.max(14, dimensions.height * 0.035))
      .attr('text-anchor', 'middle')
      .attr('fill', 'url(#lineGradient)')
      .style('font-size', `${fontSize * 1.2}px`)
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('font-weight', '600')
      .style('text-shadow', '0 0 10px rgba(255,255,255,0.2)');
    const node = priceCard.node();
    if (node) {
      priceCardRef.current = node;
    }
  }, [dimensions.width, dimensions.height, innerWidth, innerHeight, fontSize]);

  // Update chart data on initialization and animation
  useEffect(() => {
    if (dataPoint === null) return;
    if (!isInitialized.current) {
      const initialData = Array(visibleCount).fill(dataPoint);
      updateScales(initialData);
      updateAxes();
      updatePriceCard();
      d3.select(pathRef.current).datum(initialData).attr('d', lineGenerator.current);
      setChartData(initialData);
      isInitialized.current = true;
      if (dataQueue.current.length > 0) {
        runAnimationCycle();
      }
    } else {
      dataQueue.current.push(dataPoint);
      if (!isAnimating.current) {
        runAnimationCycle();
      }
    }
  }, [
    dataPoint,
    runAnimationCycle,
    visibleCount,
    updateScales,
    updateAxes,
    updatePriceCard,
    lineGenerator,
    pathRef,
  ]);

  return {
    chartData,
    setChartData,
    dataQueue,
    isAnimating,
    isInitialized,
  };
}
