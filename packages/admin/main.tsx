import React from 'react';
import { createRoot } from 'react-dom/client';
import MarketingWorkspace from './MarketingWorkspace';
import Analytics from '@vercel/analytics';

function App() {
  return (
    <div>
      <h1>Admin Autopilot & Marketing</h1>
      <MarketingWorkspace />
    </div>
  );
}

// Initialize Vercel Analytics (no-op if not configured)
try {
  Analytics.inject({ disableAutoTrack: false });
} catch (err) {
  // ignore initialization errors in dev
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
