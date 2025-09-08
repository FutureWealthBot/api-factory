import React from 'react';
import { createRoot } from 'react-dom/client';
import MarketingWorkspace from './MarketingWorkspace';

function App() {
  return (
    <div>
      <h1>Admin Autopilot & Marketing</h1>
      <MarketingWorkspace />
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
