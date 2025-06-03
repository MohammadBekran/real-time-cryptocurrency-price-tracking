"use client";

import { useState, useCallback } from "react";

interface ITrade {
  id: string;
  time: string;
  type: "Buy" | "Sell";
  price: number;
  amount: number;
  total: number;
}

interface IMarketData {
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export const useTrades = () => {
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [marketData, setMarketData] = useState<IMarketData>({
    volume24h: 1.2e9,
    marketCap: 45.8e9,
    high24h: 52450,
    low24h: 48920,
  });

  // Generate random trade
  const generateTrade = useCallback((price: number): ITrade => {
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
