import React from 'react';
import { render, screen } from '@testing-library/react';
import Roadmap from './Roadmap';

test('renders roadmap stages', () => {
  render(<Roadmap />);
  expect(screen.getByText(/Stage 1 — Foundation/i)).toBeInTheDocument();
});
