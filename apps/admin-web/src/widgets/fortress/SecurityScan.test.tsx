import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SecurityScan from './SecurityScan';

beforeEach(() => {
  // @ts-ignore
  global.fetch = vi.fn();
});

afterEach(() => {
  // remove the mocked fetch to avoid leaking between tests
  // @ts-ignore
  try { delete (global as any).fetch } catch {}
});

test('renders findings from API', async () => {
  const mock = {
    scannedAt: new Date().toISOString(),
    summary: { total: 1, issues: 1, critical: 1, recommendations: 0 },
    findings: [{ id: 'F-1', severity: 'critical', title: 'Test issue', details: 'Details' }]
  };
  // @ts-ignore
  (global.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });

  render(<SecurityScan />);

  await waitFor(() => expect(screen.getByText(/Security Scan/i)).toBeInTheDocument());
  expect(screen.getByText(/Test issue/i)).toBeInTheDocument();
});
