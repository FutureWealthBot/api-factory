import React, { useEffect, useState } from 'react';
import BarChart from './BarChart';

export default function AnalyticsDashboard() {
  const [globalUsage, setGlobalUsage] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const usageRes = await fetch('/api/usage');
        const usageData = await usageRes.json();
        setGlobalUsage(usageData.usage || []);
        const eventsRes = await fetch('/api/admin/usage/recent?n=20');
        const eventsData = await eventsRes.json();
        setRecentEvents(eventsData.data || []);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleExport() {
    const csv = [
      'ts,api_key,route,method,status,bytes',
      ...recentEvents.map(e => [e.ts, e.api_key, e.route, e.method, e.status, e.bytes ?? ''].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-events-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Prepare chart data
  const chartLabels = globalUsage.map((u: any) => u.api_key || 'unknown');
  const chartData = globalUsage.map((u: any) => u.count);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>Usage Analytics</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <div style={{ marginBottom: 24 }}>
            <BarChart labels={chartLabels} data={chartData} title="Requests per API Key" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <button onClick={handleExport}>Export Recent Events (CSV)</button>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 12 }}>
            <h3>Recent Usage Events</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>API Key</th>
                    <th>Route</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Bytes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((e, i) => (
                    <tr key={i}>
                      <td>{e.ts}</td>
                      <td>{e.api_key}</td>
                      <td>{e.route}</td>
                      <td>{e.method}</td>
                      <td>{e.status}</td>
                      <td>{e.bytes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
