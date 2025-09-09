import React from "react";
import { createRoot } from "react-dom/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import client from "prom-client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// import { ApiFactoryClient } from "@api-factory/sdk-ts";
// const client = new ApiFactoryClient({ BASE: "/" }); // Vite proxy to API
// const pong = await client.ping.ping();

type Resp = any;

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      {props.children}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div style={{
      position: "fixed", top: 16, right: 16,
      background: "#fee2e2", color: "#991b1b",
      border: "1px solid #fecaca", borderRadius: 8,
      padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}>
      {text}
    </div>
  );
}

function App() {
  const [health, setHealth] = React.useState<Resp>(null);
  const [ping, setPing] = React.useState<Resp>(null);
  const [lastAction, setLastAction] = React.useState<Resp>(null);
  const [echoText, setEchoText] = React.useState<string>("hello world");
  const [tgMsg, setTgMsg] = React.useState<string>("hello from Admin");
  const [tgChatId, setTgChatId] = React.useState<string>("123");
  const [rate, setRate] = React.useState<{limit?: string; remaining?: string; reset?: string}>({});
  const [resetIn, setResetIn] = React.useState<number | undefined>(undefined);
  const [toast, setToast] = React.useState<string | null>(null);
  type MetricsState = {
    total?: number;
    byStatus?: Record<string, number>;
    reqPerSec?: number;              // rolling from counter deltas
    latency?: { p50?: number; p90?: number; p99?: number }; // seconds
  };
  const [metrics, setMetrics] = React.useState<MetricsState>({});
  const [metricsAuto, setMetricsAuto] = React.useState<boolean>(true);
  const [metricsEveryMs, setMetricsEveryMs] = React.useState<number>(5000);
  const samplesRef = React.useRef<Array<{ t: number; total: number }>>([]);

  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2500); };

  React.useEffect(() => {
    if (!rate?.reset) return;
    const start = Number(rate.reset);
    if (Number.isNaN(start)) return;

    setResetIn(start);
    const id = setInterval(() => {
      setResetIn((s) => (s && s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [rate?.reset]);

  function rateColor() {
    const limit = Number(rate.limit ?? 0);
    const remaining = Number(rate.remaining ?? 0);
    if (!limit) return "#e5e7eb"; // gray
    const pct = remaining / limit;
    if (pct > 0.5) return "#10b981"; // green
    if (pct > 0.2) return "#f59e0b"; // amber
    return "#ef4444"; // red
  }

  async function fetchHealth() {
    const r = await fetch("/_api/healthz");
    setHealth(await r.json());
  }
  async function fetchPing() {
    const r = await fetch("/api/v1/hello/ping");
    setPing(await r.json());
  }

  async function callAction(body: object) {
    const r = await fetch("/api/v1/actions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_API_FACTORY_ADMIN_KEY ?? ""}`
      },
      body: JSON.stringify(body)
    });

    const limit = r.headers.get("x-ratelimit-limit") ?? undefined;
    const remaining = r.headers.get("x-ratelimit-remaining") ?? undefined;
    const reset = r.headers.get("x-ratelimit-reset") ?? undefined;
    setRate({ limit, remaining, reset });

    let json: any;
    try { json = await r.json(); } catch { json = { success: false, error: { code: "BAD_JSON" } }; }
    if (!r.ok && json?.error?.code === "RATE_LIMITED") showToast("Rate limited—try again shortly.");
    if (!r.ok && json?.error?.code === "UNAUTHORIZED") showToast("Unauthorized: check Admin API key config.");
    setLastAction(json);
  }

  // Actions
  const triggerCollection = () => callAction({ action: "trigger_collection" });
  const sendTelegram = () =>
    callAction({ action: "send_telegram_alert", payload: { chat_id: tgChatId, message: tgMsg } });
  const upsertSample = () =>
    callAction({ action: "upsert_opportunities", payload: { items: [{ id: "x1", pair: "BTC/USDT" }] } });

  // Simple echo to show POST works
  const echo = async () => {
    const r = await fetch("/api/v1/hello/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: "admin-web", text: echoText })
    });
    const json = await r.json();
    setLastAction(json);
    console.log({ json, r });
  };

  // === Prometheus parser ===
  function parsePrometheus(body: string) {
    const lineRe = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+([0-9.eE+-]+)(?:\s+[0-9.eE+-]+)?$/;
    const labelsRe = /(\w+)\s*=\s*"([^"]*)"/g;

    const out: Record<string, Array<{ labels: Record<string, string>; value: number }>> = {};
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const m = lineRe.exec(line);
      if (!m) continue;
      const [, name, labelBlock, valStr] = m;
      const labels: Record<string, string> = {};
      if (labelBlock) {
        let lbm;
        // eslint-disable-next-line no-cond-assign
        while (lbm = labelsRe.exec(labelBlock)) {
          const [, key, val] = lbm;
          labels[key] = val;
        }
      }
      const value = Number(valStr);
      if (Number.isNaN(value)) continue;
      if (!out[name]) out[name] = [];
      out[name].push({ labels, value });
    }
    return out;
  }

  // --- Metrics ---
  const metricsUrl = "/api/v1/metrics";
  React.useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      const r = await fetch(metricsUrl);
      if (!r.ok) return setMetrics({});
      const text = await r.text();
      if (!active) return;
      const parsed = parsePrometheus(text);
      setMetrics((ms) => {
        const out = { ...ms };
        for (const [name, vals] of Object.entries(parsed)) {
          if (!out[name]) out[name] = { total: 0 };
          for (const { labels, value } of vals) {
            out[name].total += value;
            for (const [key, val] of Object.entries(labels)) {
              if (!out[name][key]) out[name][key] = 0;
              out[name][key] += value;
            }
          }
        }
        return out;
      });
    };
    fetchMetrics();
    const id = setInterval(fetchMetrics, metricsEveryMs);
    return () => { active = false; clearInterval(id); };
  }, [metricsUrl, metricsEveryMs]);

  // --- Sample count ---
  React.useEffect(() => {
    let active = true;
    const fetchSamples = async () => {
      const r = await fetch("/api/v1/opportunities/count");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      samplesRef.current = json.samples ?? [];
    };
    fetchSamples();
    const id = setInterval(fetchSamples, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Auto-refresh ---
  React.useEffect(() => {
    let active = true;
    const fetchAuto = async () => {
      const r = await fetch("/api/v1/auto-refresh");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      setMetricsAuto(json.enabled);
      setMetricsEveryMs(json.interval_ms);
    };
    fetchAuto();
    const id = setInterval(fetchAuto, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Health ---
  React.useEffect(() => {
    let active = true;
    const fetchHealth = async () => {
      const r = await fetch("/_api/healthz");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      setHealth(json);
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Ping ---
  React.useEffect(() => {
    let active = true;
    const fetchPing = async () => {
      const r = await fetch("/api/v1/hello/ping");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      setPing(json);
    };
    fetchPing();
    const id = setInterval(fetchPing, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Latency ---
  const [latencyData, setLatencyData] = React.useState<Array<{ t: number; p50: number; p90: number; p99: number }>>([]);
  React.useEffect(() => {
    let active = true;
    const fetchLatency = async () => {
      const r = await fetch("/api/v1/latency");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      setLatencyData((d) => [...d, json].slice(-50));
    };
    fetchLatency();
    const id = setInterval(fetchLatency, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Quantiles ---
  const [quantilesData, setQuantilesData] = React.useState<Array<{ t: number; p50: number; p90: number; p99: number }>>([]);
  React.useEffect(() => {
    let active = true;
    const fetchQuantiles = async () => {
      const r = await fetch("/api/v1/quantiles");
      if (!r.ok) return;
      const json = await r.json();
      if (!active) return;
      setQuantilesData((d) => [...d, json].slice(-50));
    };
    fetchQuantiles();
    const id = setInterval(fetchQuantiles, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // --- Metrics ---
  const metricsNames = Object.keys(metrics);
  const metricsTotal = metricsNames.reduce((sum, name) => sum + (metrics[name]?.total ?? 0), 0);
  const metricsByStatus = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const name of metricsNames) {
      const val = metrics[name];
      if (!val?.byStatus) continue;
      for (const [status, count] of Object.entries(val.byStatus)) {
        if (!out[status]) out[status] = 0;
        out[status] += count;
      }
    }
    return out;
  }, [metrics, metricsNames]);

  // --- Sample count ---
  const sampleCount = samplesRef.current.reduce((sum, s) => sum + (s.total ?? 0), 0);

  // --- Latency ---
  const latencyLatest = latencyData[latencyData.length - 1];
  const latencyAvg = React.useMemo(() => {
    if (!latencyData.length) return 0;
    const sum = latencyData.reduce((s, d) => s + (d.p50 ?? 0), 0);
    return Math.round((sum / latencyData.length) * 1000);
  }, [latencyData]);
  const latencyQuantiles = React.useMemo(() => {
    if (!latencyData.length) return {};
    const ordered = [...latencyData].sort((a, b) => a.p50 - b.p50);
    const total = ordered.length;
    function q(qp: number) {
      const target = total * qp;
      for (const b of ordered) {
        if (b.p50 >= target) return b.p50;
      }
      return ordered[ordered.length - 1].p50;
    }
    const p50 = q(0.5);
    const p90 = q(0.9);
    const p99 = q(0.99);
    return { p50, p90, p99 };
  }, [latencyData]);

  // --- Quantiles ---
  const quantilesLatest = quantilesData[quantilesData.length - 1];
  const quantilesAvg = React.useMemo(() => {
    if (!quantilesData.length) return 0;
    const sum = quantilesData.reduce((s, d) => s + (d.p50 ?? 0), 0);
    return Math.round((sum / quantilesData.length) * 1000);
  }, [quantilesData]);
  const quantilesEstimates = React.useMemo(() => {
    if (!quantilesData.length) return {};
    const ordered = [...quantilesData].sort((a, b) => a.p50 - b.p50);
    const total = ordered.length;
    function q(qp: number) {
      const target = total * qp;
      for (const b of ordered) {
        if (b.p50 >= target) return b.p50;
      }
      return ordered[ordered.length - 1].p50;
    }
    const p50 = q(0.5);
    const p90 = q(0.9);
    const p99 = q(0.99);
    return { p50, p90, p99 };
  }, [quantilesData]);

  function StatusBars({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    const max = Math.max(1, ...entries.map(([, v]) => v));
    const width = 360, barH = 16, gap = 8, left = 36, right = 8;
    const height = entries.length * (barH + gap) + 8;
    return (
      <svg width={width} height={height} role="img" aria-label="Status breakdown">
        {entries.map(([code, v], i) => {
          const y = 4 + i * (barH + gap);
          const w = ((width - left - right) * v) / max;
          const fill =
            code.startsWith("2") ? "#10b981" :
            code.startsWith("3") ? "#06b6d4" :
            code.startsWith("4") ? "#f59e0b" :
            "#ef4444";
          return (
            <g key={code}>
              <text x={8} y={y + barH - 4} fontSize="12" fill="#374151">{code}</text>
              <rect x={left} y={y} width={w} height={barH} fill={fill} rx="4" />
              <text x={left + w + 6} y={y + barH - 4} fontSize="12" fill="#6b7280">{v}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  function UsagePanel() {
    const [apiKey, setApiKey] = React.useState<string>("");
    const [days, setDays] = React.useState<number>(7);
    const [usage, setUsage] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    async function fetchUsage() {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400 * 1000).toISOString();
      let q = sb.from("usage_events").select("*").gte("ts", since).order("ts", { ascending: false });
      if (apiKey) q = q.eq("api_key", apiKey);
      const { data, error } = await q.limit(1000);
      setUsage(data ?? []);
      setLoading(false);
    }

    React.useEffect(() => { fetchUsage(); }, [apiKey, days]);

    // Aggregate by status
    const byStatus = usage.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <Card title="Usage Events">
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="API Key (optional)"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ marginRight: 8, width: 220 }}
          />
          <select value={days} onChange={e => setDays(Number(e.target.value))}>
            {[1, 7, 30].map(d => <option key={d} value={d}>{d} days</option>)}
          </select>
          <button onClick={fetchUsage} disabled={loading} style={{ marginLeft: 8 }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div>
          <strong>Total events:</strong> {usage.length}
          <br />
          <strong>Status breakdown:</strong>{" "}
          {Object.entries(byStatus).map(([s, n]) => `${s}: ${n}`).join(", ")}
        </div>
        <pre style={{ maxHeight: 200, overflow: "auto", background: "#f9fafb", marginTop: 12 }}>
          {JSON.stringify(usage.slice(0, 20), null, 2)}
        </pre>
      </Card>
    );
  }

  function BillingPanel() {
    const [apiKey, setApiKey] = React.useState<string>("");
    const [quota, setQuota] = React.useState<number | null>(null);
    const [used, setUsed] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(false);

    // Fetch quota (from env, Supabase, or config service)
    async function fetchQuota() {
      setLoading(true);
      // Example: fetch from Supabase "tenants" table or config endpoint
      // Replace with your actual quota source
      let q = 1000; // default fallback
      if (apiKey) {
        // Example: fetch from Supabase
        // const { data } = await sb.from("tenants").select("quota").eq("api_key", apiKey).single();
        // q = data?.quota ?? q;
      }
      setQuota(q);
      setLoading(false);
    }

    // Fetch usage (from usage_events)
    async function fetchUsed() {
      setLoading(true);
      if (!apiKey) { setUsed(0); setLoading(false); return; }
      const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
      const { count } = await sb
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("api_key", apiKey)
        .gte("ts", since);
      setUsed(count ?? 0);
      setLoading(false);
    }

    React.useEffect(() => { fetchQuota(); fetchUsed(); }, [apiKey]);

    const pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0;
    const color = pct < 80 ? "#10b981" : pct < 100 ? "#f59e0b" : "#ef4444";

    return (
      <Card title="Billing & Quota">
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ marginRight: 8, width: 220 }}
          />
          <button onClick={() => { fetchQuota(); fetchUsed(); }} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div>
          <strong>Quota:</strong> {quota ?? "?"} calls/month<br />
          <strong>Used:</strong> {used} calls<br />
          <strong>Remaining:</strong> {quota !== null ? quota - used : "?"} calls
          <div style={{ margin: "12px 0", height: 18, background: "#f3f4f6", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`,
              height: "100%",
              background: color,
              transition: "width 0.3s"
            }} />
          </div>
          <span style={{ color }}>{pct}% of quota used</span>
        </div>
        <div style={{ marginTop: 16 }}>
          {/* Stripe integration placeholder */}
          <button
            style={{
              background: "#635bff", color: "#fff", border: "none", borderRadius: 6,
              padding: "8px 18px", fontWeight: 600, fontSize: 16, cursor: "pointer"
            }}
            onClick={() => window.open("https://dashboard.stripe.com/", "_blank")}
          >
            Manage Billing (Stripe)
          </button>
        </div>
      </Card>
    );
  }

  function AlertsPanel() {
    const [apiKey, setApiKey] = React.useState<string>("");
    const [alerts, setAlerts] = React.useState<Array<{ ts: string; type: string; message: string }>>([]);
    const [loading, setLoading] = React.useState(false);

    // Example: Fetch recent usage and show alerts if quota >80% or errors
    async function fetchAlerts() {
      setLoading(true);
      if (!apiKey) { setAlerts([]); setLoading(false); return; }
      // Fetch quota and usage
      let quota = 1000;
      // const { data: tenant } = await sb.from("tenants").select("quota").eq("api_key", apiKey).single();
      // quota = tenant?.quota ?? quota;
      const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
      const { data } = await sb.from("usage_events").select("*").eq("api_key", apiKey).gte("ts", since).order("ts", { ascending: false }).limit(1000);
      const used = data?.length ?? 0;
      const pct = quota ? (used / quota) * 100 : 0;
      const alertList: Array<{ ts: string; type: string; message: string }> = [];
      if (pct > 80) alertList.push({ ts: new Date().toISOString(), type: "quota", message: `Warning: ${Math.round(pct)}% of quota used.` });
      if (data) {
        for (const ev of data) {
          if (ev.status >= 400) alertList.push({ ts: ev.ts, type: "error", message: `Error ${ev.status} on ${ev.route}` });
        }
      }
      setAlerts(alertList.slice(0, 10));
      setLoading(false);
    }

    React.useEffect(() => { fetchAlerts(); }, [apiKey]);

    return (
      <Card title="Alerts">
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ marginRight: 8, width: 220 }}
          />
          <button onClick={fetchAlerts} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <ul>
          {alerts.length === 0 && <li>No alerts.</li>}
          {alerts.map((a, i) => (
            <li key={i} style={{ color: a.type === "quota" ? "#f59e0b" : "#ef4444" }}>
              [{a.ts.slice(0, 19).replace("T", " ")}] {a.message}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  function ApiKeyPanel() {
    const [apiKeys, setApiKeys] = React.useState<Array<{ id: string; key: string; created_at: string }>>([]);
    const [newKey, setNewKey] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    // Fetch all keys (replace with your actual Supabase table/logic)
    async function fetchKeys() {
      setLoading(true);
      // Example: fetch from Supabase "api_keys" table
      // const { data } = await sb.from("api_keys").select("*").order("created_at", { ascending: false });
      // setApiKeys(data ?? []);
      setApiKeys([]); // placeholder
      setLoading(false);
    }

    // Create a new key
    async function createKey() {
      setLoading(true);
      // Example: insert into Supabase
      // const { data } = await sb.from("api_keys").insert({}).single();
      // setNewKey(data?.key ?? null);
      setNewKey("sk_live_xxx"); // placeholder
      fetchKeys();
      setLoading(false);
    }

    // Revoke a key
    async function revokeKey(id: string) {
      setLoading(true);
      // await sb.from("api_keys").delete().eq("id", id);
      fetchKeys();
      setLoading(false);
    }

    React.useEffect(() => { fetchKeys(); }, []);

    return (
      <Card title="API Key Management">
        <button onClick={createKey} disabled={loading} style={{ marginBottom: 12 }}>
          {loading ? "Creating..." : "Create New API Key"}
        </button>
        {newKey && (
          <div style={{ marginBottom: 12, color: "#10b981" }}>
            New key: <code>{newKey}</code>
          </div>
        )}
        <ul>
          {apiKeys.length === 0 && <li>No API keys found.</li>}
          {apiKeys.map(k => (
            <li key={k.id}>
              <code>{k.key}</code> (created {k.created_at})
              <button onClick={() => revokeKey(k.id)} style={{ marginLeft: 8, color: "#ef4444" }}>Revoke</button>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: "24px", marginBottom: "32px", textAlign: "center" }}>Admin Dashboard</h1>

      {toast && <Toast text={toast} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Health">
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </Card>
        <Card title="Ping">
          <pre>{JSON.stringify(ping, null, 2)}</pre>
        </Card>
        <Card title="Last Action">
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </Card>
        <Card title="Rate Limit">
          <div style={{ fontSize: "24px", fontWeight: "bold", color: rateColor() }}>
            {rate.remaining} / {rate.limit}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Resets in: {resetIn !== undefined ? `${resetIn} seconds` : "N/A"}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 32 }}>
        <Card title="Metrics">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={fetchMetrics}>Refresh Metrics</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={metricsAuto}
                onChange={e => setMetricsAuto(e.target.checked)}
              />
              Auto-refresh
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Every (ms):
              <input
                type="number"
                min={1000}
                step={500}
                value={metricsEveryMs}
                onChange={e => setMetricsEveryMs(Number(e.target.value || 5000))}
                style={{ width: 100 }}
              />
            </label>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <h4 style={{ margin: "6px 0" }}>Totals</h4>
              <pre style={{ margin: 0 }}>
{JSON.stringify({
  total: metrics.total ?? 0,
  reqPerSec: metrics.reqPerSec ? Number(metrics.reqPerSec.toFixed(2)) : 0
}, null, 2)}
              </pre>

              <h4 style={{ margin: "12px 0 6px" }}>Latency (s)</h4>
              <pre style={{ margin: 0 }}>
{JSON.stringify({
  p50: metrics.latency?.p50 ?? null,
  p90: metrics.latency?.p90 ?? null,
  p99: metrics.latency?.p99 ?? null
}, null, 2)}
              </pre>
            </div>

            <div>
              <h4 style={{ margin: "6px 0" }}>Status breakdown</h4>
              {metrics.byStatus && Object.keys(metrics.byStatus).length > 0 ? (
                <StatusBars data={metrics.byStatus} />
              ) : (
                <div style={{ color: "#6b7280" }}>No http_requests_total yet.</div>
              )}
            </div>
          </div>
        </Card>
        <Card title="Samples">
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{sampleCount}</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Total samples</div>
        </Card>
        <Card title="Latency (p50)">
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{latencyAvg} ms</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Average latency</div>
        </Card>
        <Card title="Quantiles (p50)">
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{quantilesAvg} ms</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Average quantiles</div>
        </Card>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Actions</h2>
        <button onClick={triggerCollection} style={{ padding: "10px 20px", fontSize: "16px", marginRight: 16 }}>
          Trigger Collection
        </button>
        <button onClick={sendTelegram} style={{ padding: "10px 20px", fontSize: "16px", marginRight: 16 }}>
          Send Telegram Alert
        </button>
        <button onClick={upsertSample} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Upsert Sample
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Echo Test</h2>
        <input
          type="text"
          value={echoText}
          onChange={(e) => setEchoText(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "100%", maxWidth: 400, marginBottom: 16 }}
        />
        <button onClick={echo} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Send Echo
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Metrics Data</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Samples Data</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(samplesRef.current, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Latency Data</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(latencyData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Quantiles Data</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(quantilesData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Status Breakdown</h2>
        <StatusBars data={metricsByStatus} />
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "20px", marginBottom: 16 }}>Usage Events</h2>
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="API Key (optional)"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ marginRight: 8, width: 220 }}
          />
          <select value={days} onChange={e => setDays(Number(e.target.value))}>
            {[1, 7, 30].map(d => <option key={d} value={d}>{d} days</option>)}
          </select>
          <button onClick={fetchUsage} disabled={loading} style={{ marginLeft: 8 }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div>
          <strong>Total events:</strong> {usage.length}
          <br />
          <strong>Status breakdown:</strong>{" "}
          {Object.entries(byStatus).map(([s, n]) => `${s}: ${n}`).join(", ")}
        </div>
        <pre style={{ maxHeight: 200, overflow: "auto", background: "#f9fafb", marginTop: 12 }}>
          {JSON.stringify(usage.slice(0, 20), null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 32 }}>
        <UsagePanel />
      </div>

      <div style={{ marginTop: 32 }}>
        <BillingPanel />
      </div>

      <div style={{ marginTop: 32 }}>
        <AlertsPanel />
      </div>

      <div style={{ marginTop: 32 }}>
        <ApiKeyPanel />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(<App />);

// Inside /api/v1/actions route config:
config: {
  rateLimit: {
    max: Number(process.env.ACTIONS_RATE_MAX ?? 100),
    timeWindow: process.env.ACTIONS_RATE_WINDOW ?? "1 minute",
    keyGenerator: (req) => {
      // Prefer API key (per-tenant), fallback to IP
      const auth = (req.headers?.authorization ?? "").toString();
      if (auth.startsWith("Bearer ")) return auth.slice(7);
      if (req.headers?.["x-api-key"]) return String(req.headers["x-api-key"]);
      return req.ip;
    }
  }
}

## TRACK file

This repository contains a top-level `TRACK` file (for example: `MVP`) that records the active release track.

- Workflows load `TRACK` into `env.TRACK` so CI can conditionally change behavior.
- Services read `process.env.TRACK` at runtime or fall back to the `TRACK` file.
- You can check the active track by calling the API `_meta` endpoint (e.g. `GET http://localhost:8787/_meta`).

// OpenAPI Specification
openapi: 3.0.3
info:
  title: API Factory
  version: 0.1.0
servers:
  - url: http://localhost:8787
paths:
  /_api/healthz:
    get:
      operationId: health
      responses: { "200": { description: ok } }
  /api/v1/hello/ping:
    get:
      operationId: ping
      responses: { "200": { description: ok } }
  /api/v1/hello/echo:
    post:
      operationId: echo
      requestBody:
        required: false
        content:
          application/json:
            schema: { type: object, additionalProperties: true }
      responses: { "200": { description: ok } }
  /api/v1/actions:
    post:
      operationId: actions
      parameters:
        - in: header
          name: Authorization
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              oneOf:
                - type: object
                  properties:
                    action: { enum: [trigger_collection] }
                - type: object
                  properties:
                    action: { enum: [upsert_opportunities] }
                    payload:
                      type: object
                      properties:
                        items:
                          type: array
                          items: { type: object, additionalProperties: true }
                - type: object
                  properties:
                    action: { enum: [send_telegram_alert] }
                    payload:
                      type: object
                      properties:
                        chat_id: { type: string }
                        message: { type: string }
      responses: { "200": { description: ok } }
{
  "name": "@api-factory/sdk-ts",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "gen": "openapi -i ../../openapi.yaml -o src --client fetch --name ApiFactoryClient",
    "build": "tsc -p tsconfig.json && node ./scripts/bundle.mjs",
    "prepublishOnly": "pnpm build"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "openapi-typescript-codegen": "^0.29.0"
  }
}

import { promises as fs } from "node:fs";
import path from "node:path";

const srcDir = path.resolve("src");
const distDir = path.resolve("dist");
await fs.mkdir(distDir, { recursive: true });

async function copy(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const from = path.join(dir, e.name);
    const rel = path.relative(srcDir, from);
    const to = path.join(distDir, rel);
    if (e.isDirectory()) { await fs.mkdir(to, { recursive: true }); await copy(from); }
    else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".js") || e.name.endsWith(".d.ts"))) {
      // compiled JS/DTs already emitted by tsc into dist; skip
    }
  }
}
await copy(srcDir);

// SQL to create usage_events table
create table if not exists public.usage_events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  api_key text,
  route text not null,
  method text not null,
  status int not null,
  bytes int not null default 0,
  meta jsonb
);

create index if not exists usage_events_ts_idx on public.usage_events (ts desc);
create index if not exists usage_events_key_ts_idx on public.usage_events (api_key, ts desc);

type UE = {
  ts: string;
  api_key: string | null;
  route: string;
  method: string;
  status: number;
  bytes: number;
  meta?: Record<string, unknown>;
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const queue: UE[] = [];
let ticking = false;

export function enqueueUsage(ev: UE) {
  queue.push(ev);
  if (!ticking) flushSoon();
}

function flushSoon() {
  ticking = true;
  setTimeout(flush, 1000);
}

async function flush() {
  ticking = false;
  if (queue.length === 0) return;
  const batch = queue.splice(0, 200);
  try {
    const { error } = await sb.from("usage_events").insert(batch);
    if (error) {
      queue.unshift(...batch);
    }
  } catch {
    queue.unshift(...batch);
  }
  if (queue.length > 0) flushSoon();
}

// ...after routes/middleware
app.addHook("onResponse", async (req, reply) => {
  const auth = (req.headers["authorization"] ?? "").toString();
  const apiKey = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-api-key"] as string | undefined) ?? null;
  const route = (req as any).routerPath || req.url;
  httpReqs.inc({
    method: req.method,
    route,
    status: String(reply.statusCode),
    api_key: apiKey ?? "anon"
  });
});

// GitHub Actions workflow for SDK TypeScript Publish
name: SDK TypeScript Publish

on:
  push:
    tags:
      - "v*"

jobs:
  sdk-validate-build-publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./packages/sdk-ts
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with: { version: 9 }

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install

      - name: Validate OpenAPI spec
        run: |
          pnpm add -w -D @apideck/openapi-validator-cli
          npx openapi validate ../../openapi.yaml

      - name: Generate SDK
        run: pnpm gen

      - name: Build SDK
        run: pnpm build

      - name: Publish to npm
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm publish --access public --no-git-checks

# API Reference

```yaml
<!-- embed openapi.yaml here or link to it -->
```

