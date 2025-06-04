"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  IMarketData,
  IPricePoint,
  ITradeHistory,
} from "@/features/home/core/types";

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

  // Get initial price from REST API
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

  // Mock data generator
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

export const useTrades = () => {
  const [trades, setTrades] = useState<ITradeHistory[]>([]);
  const [marketData, setMarketData] = useState<IMarketData>({
    volume24h: 1.2e9,
    marketCap: 45.8e9,
    high24h: 52450,
    low24h: 48920,
  });

  // Generate random trade
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

  // Add a new trade
  const addTrade = useCallback(
    (price: number) => {
      const newTrade = generateTrade(price);
      setTrades((prev) => [newTrade, ...prev].slice(0, 10));
    },
    [generateTrade]
  );

  // Update market data
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
