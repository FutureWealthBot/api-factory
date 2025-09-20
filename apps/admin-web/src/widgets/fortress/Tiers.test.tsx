import React from 'react';
import { render, screen } from '@testing-library/react';
import Tiers from './Tiers';

test('renders tiers list', () => {
  render(<Tiers />);
  // use heading role to avoid matching list items that contain the word
  expect(screen.getByRole('heading', { name: /Starter/i })).toBeInTheDocument();
  // Enterprise tier removed
});
