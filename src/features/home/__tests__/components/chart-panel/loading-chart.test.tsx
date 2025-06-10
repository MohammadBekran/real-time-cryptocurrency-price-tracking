import { describe, it, expect } from 'vitest';

import LoadingChart from '@/features/home/components/chart-panel/loading-chart';

import { render, screen } from '@/test/utils';

describe('LoadingChart', () => {
  it('renders without crashing', () => {
    render(<LoadingChart />);
    expect(screen.getByTestId('loading-chart')).toBeInTheDocument();
  });
});
