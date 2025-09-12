import { useState } from 'react';

export default function RetirementPlannerPage() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_RETIREMENT_PLANNER === 'true';
  const [pension, setPension] = useState('');
  const [ira, setIra] = useState('');
  const [socialSecurity, setSocialSecurity] = useState('');
  const [years, setYears] = useState('20');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return (
    <div>
      <div>Retirement Planner is not enabled.</div>
      <div style={{marginTop:16, color:'gray', fontSize:14}}>
        <strong>DEBUG:</strong> NEXT_PUBLIC_ENABLE_RETIREMENT_PLANNER = {String(process.env.NEXT_PUBLIC_ENABLE_RETIREMENT_PLANNER)}
      </div>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/retirement-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pension: Number(pension),
          ira: Number(ira),
          socialSecurity: Number(socialSecurity),
          years: Number(years)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h1>Retirement Planner</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>Pension: <input type="number" value={pension} onChange={e => setPension(e.target.value)} /></label>
        <label>IRA: <input type="number" value={ira} onChange={e => setIra(e.target.value)} /></label>
        <label>Social Security: <input type="number" value={socialSecurity} onChange={e => setSocialSecurity(e.target.value)} /></label>
        <label>Years in Retirement: <input type="number" value={years} onChange={e => setYears(e.target.value)} /></label>
        <button type="submit">Calculate</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Results</h2>
          <div>Total: ${result.total.toLocaleString()}</div>
          <div>Annual: ${result.annual.toLocaleString()} / year</div>
          <div>Years: {result.years}</div>
          <pre style={{ background: '#f6f6f6', padding: 8, borderRadius: 4 }}>{JSON.stringify(result.breakdown, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
