import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

type Metrics = {
  service: string
  port: number
  uptime_s: number
  requests: { total: number; healthz: number; metrics: number }
  db_latency_ms: { count: number; avg: number|null; p95: number|null; max: number|null }
  last_error?: { at: string; message: string } | null
}

export default function MetricsCard() {
  const [m, setM] = useState<Metrics | null>(null)
  const [err, setErr] = useState('')

  async function poll() {
    try {
      const res = await apiFetch<Metrics>('/_api/metrics')
      setM(res); setErr('')
    } catch (e:any) {
      setErr(String(e.message || e)); setM(null)
    }
  }

  useEffect(()=>{ poll(); const t=setInterval(poll, 5000); return ()=>clearInterval(t) }, [])

  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>CLI Metrics</h2>
      {err && <div style={{ color: 'crimson' }}>Error: {err}</div>}
      {!m ? <div>Loading…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Stat label="Uptime (s)" value={m.uptime_s} />
          <Stat label="Requests" value={m.requests.total} sub={`${m.requests.healthz} health / ${m.requests.metrics} metrics`} />
          <Stat label="DB ping (avg ms)" value={m.db_latency_ms.avg ?? '—'} sub={`p95 ${m.db_latency_ms.p95 ?? '—'} • max ${m.db_latency_ms.max ?? '—'}`} />
          <div style={{ gridColumn: '1 / -1' }}>
            <small>Port: {m.port} • Service: {m.service}</small>
            {m.last_error && <pre style={{ color: '#b45309', background:'#fff7ed', padding:8, borderRadius:8, marginTop:8 }}>{JSON.stringify(m.last_error,null,2)}</pre>}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({label, value, sub}:{label:string; value:string|number|null|undefined; sub?:string}) {
  return (
    <div style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 10 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{String(value)}</div>
      {sub && <div style={{ fontSize: 12, color: '#6b7280' }}>{sub}</div>}
    </div>
  )
}
