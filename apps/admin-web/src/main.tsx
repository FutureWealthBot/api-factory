import React from "react";
import { createRoot } from "react-dom/client";

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

function App() {
  const [health, setHealth] = React.useState<Resp>(null);
  const [ping, setPing] = React.useState<Resp>(null);
  const [lastAction, setLastAction] = React.useState<Resp>(null);
  const [echoText, setEchoText] = React.useState<string>("hello world");
  const [tgMsg, setTgMsg] = React.useState<string>("hello from Admin");
  const [tgChatId, setTgChatId] = React.useState<string>("123");

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
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await r.json();
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
  };

  React.useEffect(() => {
    fetchHealth().catch(console.error);
    fetchPing().catch(console.error);
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>API Factory – Admin</h1>
      <p>Vite dev server → proxy → Fastify API</p>

      <Card title="Service Health">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={fetchHealth}>Refresh Health</button>
          <button onClick={fetchPing}>Ping</button>
          <a href="/_api/metrics" target="_blank" rel="noreferrer">Open Metrics</a>
          <a href="/" target="_blank" rel="noreferrer">API Index</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <pre style={{ margin: 0 }}>{JSON.stringify(health, null, 2)}</pre>
          <pre style={{ margin: 0 }}>{JSON.stringify(ping, null, 2)}</pre>
        </div>
      </Card>

      <Card title="Actions">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={triggerCollection}>Trigger Collection</button>
            <button onClick={upsertSample}>Upsert Sample Opportunity</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>
              Echo Text:
              <input value={echoText} onChange={e => setEchoText(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            </label>
            <button onClick={echo}>POST /hello/echo</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>
              Telegram Chat ID:
              <input value={tgChatId} onChange={e => setTgChatId(e.target.value)} style={{ marginLeft: 8, width: 220 }} />
            </label>
            <label>
              Telegram Message:
              <input value={tgMsg} onChange={e => setTgMsg(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            </label>
            <button onClick={sendTelegram}>Send Test Telegram Alert</button>
          </div>

          <div>
            <h4>Last Response</h4>
            <pre style={{ margin: 0 }}>{JSON.stringify(lastAction, null, 2)}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
