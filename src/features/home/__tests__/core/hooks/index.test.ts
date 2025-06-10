import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useBinanceTicker, useTrades } from '@/features/home/core/hooks';

describe('useBinanceTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useBinanceTicker());
    expect(result.current.price).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useTrades', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useTrades());
    expect(result.current.trades).toEqual([]);
    expect(result.current.marketData).toEqual({
      volume24h: 1.2e9,
      marketCap: 45.8e9,
      high24h: 52450,
      low24h: 48920,
    });
  });

  it('adds a new trade', () => {
    const { result } = renderHook(() => useTrades());
    const price = 50000;

    act(() => {
      result.current.addTrade(price);
    });

    expect(result.current.trades.length).toBe(1);
    expect(result.current.trades[0].price).toBe(price);
    expect(['Buy', 'Sell']).toContain(result.current.trades[0].type);
  });

  it('maintains maximum of 10 trades', () => {
    const { result } = renderHook(() => useTrades());
    const price = 50000;

    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addTrade(price);
      }
    });

    expect(result.current.trades.length).toBe(10);
  });

  it('updates market data', () => {
    const { result } = renderHook(() => useTrades());
    const newPrice = 53000;

    act(() => {
      result.current.updateMarketData(newPrice);
    });

    expect(result.current.marketData.high24h).toBe(newPrice);
  });
});
