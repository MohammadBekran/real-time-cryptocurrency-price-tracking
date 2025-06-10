import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpringValue } from '@react-spring/web';

import ChartHeader from '@/features/home/components/chart-panel/chart-header';

const mockSpring = {
  get: () => 50000,
  to: vi.fn(),
} as unknown as SpringValue<number>;

describe('ChartHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ChartHeader
        symbol="BTC"
        priceSpring={{ price: mockSpring }}
        priceChange={0}
        priceChangeSpring={{ change: mockSpring }}
        isConnected={false}
      />
    );
    expect(container).toBeDefined();
  });

  it('displays the symbol and connection status correctly', () => {
    render(
      <ChartHeader
        symbol="BTC"
        priceSpring={{ price: mockSpring }}
        priceChange={0}
        priceChangeSpring={{ change: mockSpring }}
        isConnected={true}
      />
    );
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders with custom symbol', () => {
    render(
      <ChartHeader
        symbol="ETH"
        priceSpring={{ price: mockSpring }}
        priceChange={0}
        priceChangeSpring={{ change: mockSpring }}
        isConnected={false}
      />
    );
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });
});
