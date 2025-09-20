import { useState, useEffect } from 'react';

export default function BillingManager() {
  const [status, setStatus] = useState('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [quotaKey, setQuotaKey] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [quotaEdit, setQuotaEdit] = useState<{plan?: string; quota?: number; status?: string}>({});
  const [quotaMsg, setQuotaMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/billing/stripe/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data.data || []));
    fetch('/api/admin/billing/stripe/events')
      .then(res => res.json())
      .then(data => setEvents(data.data || []));
  }, []);

  async function fetchQuota() {
    setQuotaMsg('');
    setQuotaInfo(null);
    if (!quotaKey) return;
    const res = await fetch(`/api/admin/billing/key?key=${encodeURIComponent(quotaKey)}`);
    const data = await res.json();
    if (data.data) setQuotaInfo(data.data);
    else setQuotaMsg(data.error || 'Not found');
  }

  async function updateQuota() {
    setQuotaMsg('');
    const res = await fetch('/api/admin/billing/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: quotaKey, ...quotaEdit })
    });
    const data = await res.json();
    if (data.data) {
      setQuotaInfo(data.data);
      setQuotaMsg('Updated!');
    } else setQuotaMsg(data.error || 'Update failed');
  }

  return (
    <div>
      <h2>Billing Management</h2>
      <section style={{ marginBottom: 24 }}>
        <h3>API Key Quota/Plan Management</h3>
        <input placeholder="API Key" value={quotaKey} onChange={e => setQuotaKey(e.target.value)} />
        <button onClick={fetchQuota}>Fetch</button>
        {quotaInfo && (
          <div style={{ marginTop: 8 }}>
            <div>Plan: {quotaInfo.plan}</div>
            <div>Quota: {quotaInfo.quota}</div>
            <div>Status: {quotaInfo.status}</div>
            <div>Expires: {quotaInfo.expiresAt}</div>
            <div style={{ marginTop: 8 }}>
              <input placeholder="Plan" value={quotaEdit.plan ?? ''} onChange={e => setQuotaEdit(q => ({ ...q, plan: e.target.value }))} />
              <input placeholder="Quota" type="number" value={quotaEdit.quota ?? ''} onChange={e => setQuotaEdit(q => ({ ...q, quota: Number(e.target.value) }))} />
              <input placeholder="Status" value={quotaEdit.status ?? ''} onChange={e => setQuotaEdit(q => ({ ...q, status: e.target.value }))} />
              <button onClick={updateQuota}>Update</button>
            </div>
          </div>
        )}
        {quotaMsg && <div style={{ color: 'red' }}>{quotaMsg}</div>}
      </section>
      <section style={{ marginBottom: 24 }}>
        <h3>Stripe Subscriptions</h3>
        <table border={1} cellPadding={6}>
          <thead>
            <tr><th>ID</th><th>Status</th><th>Customer</th><th>Plan</th><th>Current Period End</th></tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? <tr><td colSpan={5}>No subscriptions</td></tr> :
              subscriptions.map((s, i) => (
                <tr key={i}>
                  <td>{s.id}</td>
                  <td>{s.status}</td>
                  <td>{s.customer}</td>
                  <td>{s.items?.data?.[0]?.plan?.id || ''}</td>
                  <td>{s.current_period_end ? new Date(s.current_period_end * 1000).toLocaleString() : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>Recent Stripe Events</h3>
        <table border={1} cellPadding={6}>
          <thead>
            <tr><th>ID</th><th>Type</th><th>Created</th></tr>
          </thead>
          <tbody>
            {events.length === 0 ? <tr><td colSpan={3}>No events</td></tr> :
              events.map((e, i) => (
                <tr key={i}>
                  <td>{e.id}</td>
                  <td>{e.type}</td>
                  <td>{e.created ? new Date(e.created * 1000).toLocaleString() : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
