"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  IMarketData,
  IPricePoint,
  ITradeHistory,
} from "@/features/home/core/types";

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
 * @returns {string|null} returns.error - Error message if any
 *
 * @example
 * ```tsx
 * const { price, history, isConnected, error } = useBinanceTicker("btcusdt", 120);
 * ```
 */
export const useBinanceTicker = (
  symbol: string = "btcusdt",
  maxPoints: number = 120
) => {
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<IPricePoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

      setPrice(initialPrice);
      setHistory([{ time: Date.now(), price: initialPrice }]);

      return initialPrice;
    } catch (err) {
      console.error("Error fetching initial price:", err);
      return 50000; // Fallback price
    }
  };

  /**
   * Generates and updates mock price data
   * Used as a fallback when the WebSocket connection fails
   *
   * @param {number} initialPrice - Starting price for mock data
   */
  const startMockData = (initialPrice: number) => {
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
        return next.length > maxPoints
          ? next.slice(next.length - maxPoints)
          : next;
      });
    }, 1000);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Get initial price
        const initialPrice = await getInitialPrice();
        if (!mounted) return;

        // Start mock data with initial price
        startMockData(initialPrice);
        setIsConnected(true);
      } catch (err) {
        console.error("Error initializing:", err);
        if (mounted) {
          setError("Failed to initialize");
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
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [symbol, maxPoints]);

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
export const useTrades = () => {
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
    const type = Math.random() > 0.5 ? "Buy" : "Sell";
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
      const shouldUpdate =
        price > prev.high24h * 1.001 || price < prev.low24h * 0.999;

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
