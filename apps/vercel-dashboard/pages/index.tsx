import { useEffect, useState } from 'react';

type Deployment = any;

export default function Home() {
  const [list, setList] = useState<Deployment[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/deployments')
      .then((r) => r.json())
      .then((d) => setList(d))
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div>Error: {err}</div>;
  if (!list) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h1>Vercel Deployments (GitHub record)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Environment</th>
            <th style={{ textAlign: 'left' }}>Creator</th>
            <th style={{ textAlign: 'left' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {list.map((d: any) => (
            <tr key={d.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{d.id}</td>
              <td>{d.environment}</td>
              <td>{d.creator?.login || 'unknown'}</td>
              <td>{new Date(d.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
