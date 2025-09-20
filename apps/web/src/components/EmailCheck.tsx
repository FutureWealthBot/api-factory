import { useState } from 'react';

const GOV_RE = /@(.*\.(gov|mil))$/i;

export default function EmailCheck() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clientSideCheck(e: string) {
    if (!e.includes('@')) return false;
    return GOV_RE.test(e);
  }

  async function check() {
    setMsg(null);
    if (clientSideCheck(email)) {
      setMsg('Government (.gov/.mil) email domains are not allowed.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/_api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json();
        setMsg(j?.error || 'Blocked');
      } else {
        setMsg('Email OK — proceed with signup.');
      }
    } catch (err: unknown) {
      setMsg(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Test email before signup
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginLeft: 8, padding: 6 }}
        />
      </label>
      <button onClick={check} disabled={loading || !email} style={{ padding: '6px 10px' }}>
        {loading ? 'Checking…' : 'Check Email'}
      </button>
      {msg && <div style={{ marginTop: 8, color: msg.startsWith('Email OK') ? 'green' : 'crimson' }}>{msg}</div>}
    </div>
  );
}
