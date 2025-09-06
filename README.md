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

    // capture headers regardless of status
    const limit = r.headers.get("x-ratelimit-limit") ?? undefined;
    const remaining = r.headers.get("x-ratelimit-remaining") ?? undefined;
    const reset = r.headers.get("x-ratelimit-reset") ?? undefined;
    setRate({ limit, remaining, reset });

    let json: any;
    try { json = await r.json(); } catch { json = { success: false, error: { code: "BAD_JSON" } }; }

    if (!r.ok) {
      if (json?.error?.code === "RATE_LIMITED") {
        setToast("Rate limited: please try again shortly.");
        setTimeout(() => setToast(null), 2500);
      }
    }
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
      {toast && <Toast text={toast} />}
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={triggerCollection}>Trigger Collection</button>
            <button onClick={upsertSample}>Upsert Sample Opportunity</button>
            {(rate.limit || rate.remaining) && (
              <span style={{
                marginLeft: 8,
                padding: "4px 8px",
                borderRadius: 9999,
                border: `1px solid ${rateColor()}`,
                color: rateColor(),
                fontSize: 12
              }}>
                <strong>Rate:</strong> {rate.remaining ?? "?"}/{rate.limit ?? "?"}
                {typeof resetIn === "number" && <> · resets in {resetIn}s</>}
              </span>
            )}
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

      <Card title="🚀 Getting Started (Local Dev)">
        <ol>
          <li>
            <strong>Clone the repo and enter the directory:</strong>
            <pre>
              <code>
                {`git clone <your-repo-url>
cd api-factory`}
              </code>
            </pre>
          </li>
          <li>
            <strong>Run the one-shot installer:</strong><br />
            This ensures Node, pnpm, and all helper scripts are ready.
            <pre>
              <code>{`.github/scripts/install.sh`}</code>
            </pre>
          </li>
          <li>
            <strong>Start the API locally:</strong><br />
            (Pick the script that matches your setup)
            <pre>
              <code>
                {`pnpm run cli:dev
# or: pnpm run dev
# or: pnpm start`}
              </code>
            </pre>
          </li>
          <li>
            <strong>Health check (waits for :8787, then curls endpoints):</strong>
            <pre>
              <code>{`.github/scripts/ci-health.sh`}</code>
            </pre>
          </li>
          <li>
            <strong>Smoke test (GET /version, require 2xx):</strong>
            <pre>
              <code>
                {`BASE_URL=http://127.0.0.1:8787 PATHNAME=/version .github/scripts/ci-smoke.sh`}
              </code>
            </pre>
          </li>
          <li>
            <strong>POST example:</strong>
            <pre>
              <code>
                {`BASE_URL=http://127.0.0.1:8787 PATHNAME=/_api/actions METHOD=POST BODY_JSON='{"action":"ping"}' .github/scripts/ci-smoke.sh`}
              </code>
            </pre>
          </li>
          <li>
            <strong>Rate-limit headers snapshot:</strong>
            <pre>
              <code>{`BASE_URL=http://127.0.0.1:8787 PATHNAME=/version .github/scripts/ci-rate-headers.sh`}</code>
            </pre>
          </li>
          <li>
            <strong>JSON assertion (version/healthz/actions):</strong>
            <pre>
              <code>
                {`ASSERT_PROFILE=version .github/scripts/ci-assert-resolve.sh
ASSERT_PROFILE=healthz .github/scripts/ci-assert-resolve.sh`}
              </code>
            </pre>
          </li>
        </ol>

        <p><strong>Tip:</strong> All helper scripts live in <code>.github/scripts/</code> and are used by CI for consistency.</p>

        <p><strong>Next:</strong></p>
        <ul>
          <li>Push your changes:
            <pre>
              <code>{`git push origin HEAD`}</code>
            </pre>
          </li>
          <li>Open a PR or check the Actions tab for CI status.</li>
        </ul>

        <p>Welcome to API Factory! 🚦</p>
      </Card>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);


## Getting Started
**One-time setup**
```bash
# ensure Node 20+; then:
.github/scripts/install.sh
```
**Run locally**
```bash
# start your API/UI (picks best script automatically in Codespaces devcontainer)
pnpm run cli:dev   # or: pnpm run dev / pnpm start
```
**Quick health check**
VS Code: Terminal → Run Task → Health: curl /healthz & /version  
CLI:
```bash
.github/scripts/ci-health.sh
```
**Smoke test**
```bash
BASE_URL=http://127.0.0.1:8787 PATHNAME=/version .github/scripts/ci-smoke.sh
```
**Assertions**
```bash
# healthz contract
ASSERT_PROFILE=healthz ASSERT_FILE=/tmp/healthz.out .github/scripts/ci-assert-resolve.sh
# version contract
ASSERT_PROFILE=version ASSERT_FILE=/tmp/version.out .github/scripts/ci-assert-resolve.sh
```

## Helper Scripts (local parity with CI)
- `.github/scripts/install.sh` – one-shot local bootstrap (ensures pnpm, installs deps, stubs helpers).
- `.github/scripts/ci-health.sh` – waits for :8787/healthz, curls /healthz + /version.
- `.github/scripts/ci-smoke.sh` – configurable GET/POST smoke (BASE_URL, PATHNAME, METHOD, BODY_JSON, AUTH_HEADER).
- `.github/scripts/ci-rate-headers.sh` – captures x-ratelimit-* header snapshot.
- `.github/scripts/ci-assert-resolve.sh` – jq assertions with profiles:
    - **version**: requires .version & .commit strings
    - **healthz**: accepts “ok/healthy/pass” or JSON .status/.ok==true
    - **actions**: status=="ok" and object .result or .data
- `.github/scripts/ci-retry.sh` – exponential backoff wrapper for flaky calls.

## Troubleshooting
**Exit code 127 (“command not found”)**
```bash
# fix perms + CRLF + shebangs
find .github/scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \;
# run with explicit interpreter
bash .github/scripts/install.sh
# ensure tools
node -v; corepack enable && corepack prepare pnpm@9 --activate; pnpm -v
```
**Service not listening on :8787**  
Update scripts/dev-start.sh, the CI wait-on URL, or BASE_URL to your port.  
In devcontainer, forwardPorts must include 8787.

**CI flakiness**  
Steps are wrapped with `.github/scripts/ci-retry.sh`. Tune via:  
RETRY_MAX, RETRY_BASE, RETRY_FACTOR, RETRY_JITTER.

**Preview/Environments**  
Set per-env Variables/Secrets in Settings → Environments:  
BASE_URL, PATHNAME, METHOD, REQUIRE_2XX, API_KEY.  
Use ASSERT_PROFILE to pick version, healthz, or actions.

## CI Overview
**Pipeline (typical):**  
build-test → health-check → smoke-test → smoke-matrix → docker-smoke → env-previews → env-rate-headers → env-actions → env-assert

Status badge: shows workflow ci.yml on branch main.  
Jobs are designed to skip gracefully when preview env vars/secrets are not set.
