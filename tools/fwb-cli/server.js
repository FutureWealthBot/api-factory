const http = require('http');
require("dotenv").config();

const BASE_PORT = Number(process.env.PORT) || 8787;
let PORT = BASE_PORT;

let reqCount = 0;
let healthCount = 0;
let metricsCount = 0;
let lastError = null;
const latencies = []; // ms; keep last 100

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

async function supabasePing() {
  const start = Date.now();
  let ok = null, message = 'supabase-js not detected; skipping DB ping';
  try {
    const { createClient } = require('@supabase/supabase-js');
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { error } = await supabase
        .from('arbitrage_opportunities')
        .select('id', { count: 'exact', head: true });
      ok = !error;
      message = error ? error.message : 'ok';
    } else {
      ok = false;
      message = 'Missing SUPABASE_URL or SUPABASE_ANON_KEY';
    }
  } catch (e) {
    ok = null;
    message = String(e?.message || e);
  }
  const ms = Date.now() - start;
  latencies.push(ms); if (latencies.length > 100) latencies.shift();
  return { reachable: ok, message, ms };
}

function stats() {
  if (!latencies.length) return { count: 0, avg: null, p95: null, max: null };
  const arr = [...latencies].sort((a,b)=>a-b);
  const sum = arr.reduce((a,b)=>a+b,0);
  const p95 = arr[Math.floor(arr.length*0.95)-1] ?? arr[arr.length-1];
  return { count: arr.length, avg: Math.round(sum/arr.length), p95, max: arr[arr.length-1] };
}

const server = http.createServer(async (req, res) => {
  reqCount++;
  try {
    if (req.method === 'GET' && req.url.startsWith('/healthz')) {
      healthCount++;
      const envStatus = {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
      };
      const db = await supabasePing();
      return json(res, 200, {
        ok: db.reachable === true,
        service: 'FWB CLI',
        port: PORT,
        env: envStatus,
        db
      });
    }

    if (req.method === 'GET' && req.url.startsWith('/metrics')) {
      metricsCount++;
      const uptimeS = Math.round(process.uptime());
      const st = stats();
      return json(res, 200, {
        service: 'FWB CLI',
        port: PORT,
        uptime_s: uptimeS,
        requests: { total: reqCount, healthz: healthCount, metrics: metricsCount },
        db_latency_ms: st,
        last_error: lastError
      });
    }

    json(res, 404, { ok: false, error: 'Not Found' });
  } catch (e) {
    lastError = { at: new Date().toISOString(), message: String(e?.message || e) };
    json(res, 500, { ok: false, error: 'Internal Error' });
  }
});

function startServer() {
  server.listen(PORT, () => {
    console.log(`[FWB] Health server listening on http://localhost:${PORT}`);
  });
}

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE' && PORT < BASE_PORT + 10) {
    PORT += 1;
    console.log(`[FWB] Port in use; retrying on ${PORT} ...`);
    setTimeout(() => startServer(), 200);
  } else {
    console.error(err);
    process.exit(1);
  }
});

startServer();
