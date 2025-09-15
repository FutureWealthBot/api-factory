
import { useState } from 'react'
import HealthBadge from './components/HealthBadge'
import MetricsCard from './components/MetricsCard'
import EmailCheck from './components/EmailCheck'
import { apiFetch } from './lib/api'

type HealthResponse = { status: string; service?: string; [key: string]: unknown }

export default function App() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [err, setErr] = useState<string>('')

  async function checkHealth() {
    setErr('')
    setData(null)
    try {
      const json = await apiFetch<HealthResponse>('/_api/healthz')
      setData(json)
    } catch (e) {
      if (e && typeof e === 'object' && 'message' in e) {
        setErr(String((e as { message?: string }).message))
      } else {
        setErr(String(e))
      }
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 900 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>FWB Web + CLI</h1>
        <HealthBadge />
      </header>

      <p>This page calls the CLI through Vite’s dev proxy (<code>/_api/*</code> → CLI).</p>
      <button onClick={checkHealth} style={{ padding: '8px 12px', cursor: 'pointer' }}>Ping CLI</button>
      {err && <pre style={{ color: 'crimson' }}>Error: {err}</pre>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

      <MetricsCard />
      <EmailCheck />
    </div>
  )
}
