import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TierManager from './TierManager';
test('renders API Tiers', () => {
    render(_jsx(TierManager, {}));
    expect(screen.getByText(/API Tiers/i)).toBeInTheDocument();
});
