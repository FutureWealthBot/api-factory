import React from 'react';

export default function AnalyticsDashboard() {
  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>Campaign Analytics</h2>
      <p>Overview of campaign performance (placeholder).</p>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          <h3>Metrics</h3>
          <ul>
            <li>Open rate: --%</li>
            <li>Click rate: --%</li>
            <li>Conversions: --</li>
          </ul>
        </div>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12 }}>
          <h3>Recent Campaigns</h3>
          <ul>
            <li>Campaign A — 3d ago</li>
            <li>Campaign B — 7d ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
