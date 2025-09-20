import React, { useState, useEffect } from 'react';

const TIERS = [
  { name: 'core', description: 'Minimal, public, open API. Health, ping, echo, docs.' },
  { name: 'standard', description: 'Auth, rate limits, usage, keys, quotas.' },
  { name: 'advanced', description: 'Billing, Stripe, compliance, audit logs.' },
  { name: 'enterprise', description: 'Multi-region, SLA, dedicated gateway, white-label.' },
];

  const [tier, setTier] = useState('core');
  const [apiDef, setApiDef] = useState('{}');
  const [result, setResult] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetch('/sdk-templates').then(r => r.json()).then(data => {
      setTemplates((data.templates || []).filter((t: any) => t.approved));
    });
  }, []);

  async function validate() {
    const res = await fetch('/tiers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiDef: JSON.parse(apiDef), tier, templatePack: selectedTemplate })
    });
    const data = await res.json();
    setResult(data.missing || []);
  }

  return (
    <div>
      <h2>Publish API</h2>
      <select value={tier} onChange={e => setTier(e.target.value)}>
        {TIERS.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
      </select>
      <br />
      <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
        <option value="">Select SDK Template Pack (optional)</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name} ({t.language}) v{t.version}</option>
        ))}
      </select>
      <br />
      <textarea value={apiDef} onChange={e => setApiDef(e.target.value)} rows={8} cols={60} placeholder="Paste API definition (JSON)" />
      <br />
      <button onClick={validate}>Validate & Publish</button>
      {result.length > 0 && (
        <div>
          <b>Missing fields for {tier}:</b>
          <ul>{result.map(f => <li key={f}>{f}</li>)}</ul>
        </div>
      )}
      {result.length === 0 && <div>All required fields present!</div>}
    </div>
  );
}
