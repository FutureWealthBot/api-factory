import React, { useEffect, useState } from 'react';

type Finding = { id: string; severity: string; title: string; details: string };

type ScanResult = {
  scannedAt: string;
  summary: { total: number; issues: number; critical: number; recommendations: number };
  findings: Finding[];
};

export default function SecurityScan() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanResult | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const base = (window as any).ADMIN_BASE_URL || '';
        const res = await fetch(`${base}/api/fortress/scan`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  if (loading) return <div className="widget">Loading security scan...</div>;
  if (error) return <div className="widget error">Error loading scan: {error}</div>;
  if (!data) return <div className="widget">No data</div>;

  return (
    <div className="widget">
      <h3>Security Scan</h3>
      <p>Scanned at: {new Date(data.scannedAt).toLocaleString()}</p>
      <div className="scan-summary">
        <strong>Total:</strong> {data.summary.total} • <strong>Issues:</strong> {data.summary.issues} • <strong>Critical:</strong> {data.summary.critical}
      </div>
      <ul className="findings">
        {data.findings.map(f => (
          <li key={f.id} className={`finding ${f.severity}`}>
            <strong>{f.title}</strong> <span className="sev">[{f.severity}]</span>
            <div className="details">{f.details}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
