import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TemplateList from './TemplateList';
test('renders SDK Templates list', () => {
    render(_jsx(TemplateList, {}));
    expect(screen.getByText(/SDK Templates/i)).toBeInTheDocument();
});
