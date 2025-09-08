import React, { useState } from 'react';

export default function MarketingWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [campaign, setCampaign] = useState('');
  const [status, setStatus] = useState('');

  async function generateContent() {
    setStatus('Generating...');
    const res = await fetch('/api/marketing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setResult(data.result);
    setStatus('');
  }

  async function createPR() {
    setStatus('Creating PR...');
    const res = await fetch('/api/marketing/create-pr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign, content: result })
    });
    const data = await res.json();
    setStatus(data.ok ? `PR branch: ${data.branch}` : `Error: ${data.error}`);
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Marketing Campaign Autopilot</h2>
      <input
        value={campaign}
        onChange={e => setCampaign(e.target.value)}
        placeholder="Campaign name"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the campaign or content to generate"
        rows={4}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <button onClick={generateContent} disabled={!prompt || status.includes('Generating')}>Generate Content</button>
      <br />
      <textarea
        value={result}
        readOnly
        rows={6}
        style={{ width: '100%', margin: '8px 0' }}
        placeholder="Generated content will appear here"
      />
      <button onClick={createPR} disabled={!result || !campaign || status.includes('Creating')}>Create PR</button>
      <div>{status}</div>
    </div>
  );
}
