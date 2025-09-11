import { Router } from 'express';

const router = Router();

// GET /api/fortress/scan
router.get('/scan', (_req, res) => {
  // Mocked scan data
  const data = {
    scannedAt: new Date().toISOString(),
    summary: {
      total: 6,
      issues: 2,
      critical: 1,
      recommendations: 3,
    },
    findings: [
      { id: 'F-001', severity: 'critical', title: 'Open admin port', details: 'Admin port accessible from public network' },
      { id: 'F-002', severity: 'high', title: 'Weak API key rotation', details: 'API keys older than 90 days found' },
      { id: 'F-003', severity: 'medium', title: 'Missing rate limiting', details: 'Some endpoints lack rate limiting headers' },
      { id: 'F-004', severity: 'low', title: 'Missing CSP header', details: 'Content-Security-Policy not set on web app' },
      { id: 'F-005', severity: 'low', title: 'Deprecation warnings', details: 'Older SDK versions in use' },
      { id: 'F-006', severity: 'info', title: 'Scan completed', details: 'No credential leaks detected' },
    ],
  };

  res.json(data);
});

export default router;
