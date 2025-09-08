import React from 'react';
import { render, screen } from '@testing-library/react';
import TierManager from './TierManager';

test('renders API Tiers', () => {
  render(<TierManager />);
  expect(screen.getByText(/API Tiers/i)).toBeInTheDocument();
});
