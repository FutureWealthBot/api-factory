import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

type Health = { ok: boolean; port?: number; env?: Record<string, boolean>; db?: { reachable?: boolean } }

export default function HealthBadge() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string>('')

  async function poll() {
    try {
      const h = await apiFetch<Health>('/_api/healthz')
      setHealth(h)
      setError('')
    } catch (e: any) {
      setError(e?.message || 'error')
      setHealth(null)
    }
  }

  useEffect(() => {
    poll()
    const t = setInterval(poll, 5000) // poll every 5s
    return () => clearInterval(t)
  }, [])

  const ok = !!health?.ok
  const db = health?.db?.reachable
  const color = ok ? (db ? '#16a34a' : '#f59e0b') : '#ef4444'
  const label = ok ? (db ? 'Healthy' : 'Degraded') : 'Down'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        title={ok ? `CLI on port ${health?.port}` : error || 'No response'}
        style={{
          width: 10, height: 10, borderRadius: 9999, background: color,
          boxShadow: `0 0 0 2px ${color}22`
        }}
      />
      <span style={{ fontSize: 14, color: '#111' }}>{label}</span>
    </div>
  )
}
