import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TemplateList from './TemplateList';

test('renders SDK Templates list', () => {
  render(<TemplateList />);
  expect(screen.getByText(/SDK Templates/i)).toBeInTheDocument();
});
