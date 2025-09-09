import { promises as fs } from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type UsageEvent = {
  apiKey?: string;
  route: string;
  method: string;
  status: number;
  bytes?: number;
  ts: string; // ISO
};

const DEFAULT_PATH = process.env.USAGE_EVENTS_PATH || '/tmp/api-factory-usage.ndjson';
const FLUSH_INTERVAL_MS = 1000;
const MAX_BATCH = 500;

let queue: UsageEvent[] = [];
let timer: NodeJS.Timeout | null = null;
let flushing = false;

// optional Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

async function flushToDisk(events: UsageEvent[]) {
  if (!events.length) return;
  const lines = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  await fs.appendFile(DEFAULT_PATH, lines, 'utf8');
}

async function flushToSupabase(events: UsageEvent[]) {
  if (!supabase) return;
  // map to table shape expected by `usage_events` table
  const rows = events.map((e) => ({ api_key: e.apiKey ?? null, route: e.route, method: e.method, status: e.status, bytes: e.bytes ?? null, ts: e.ts }));
  const { error } = await supabase.from('usage_events').insert(rows);
  if (error) throw error;
}

async function flush() {
  if (flushing) return;
  if (!queue.length) return;
  flushing = true;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    if (supabase) {
      await flushToSupabase(batch);
    } else {
      await flushToDisk(batch);
    }
  } catch (err: unknown) {
    // on error, restore batch to front of queue (simple retry semantics)
    queue = batch.concat(queue);
    // keep a minimal console error; do not throw
    const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : String(err);
    console.error('usage flush error', msg);
  } finally {
    flushing = false;
  }
}

function start() {
  if (timer) return;
  timer = setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL_MS);
}

async function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  // final flush
  await flush();
}

function enqueue(event: UsageEvent) {
  // Keep a tiny, memory-safe queue. Drop oldest if too large.
  queue.push(event);
  if (queue.length > MAX_BATCH * 10) {
    // drop oldest 10% when runaway
    queue.splice(0, Math.floor(queue.length * 0.1));
  }
  // flush early if big
  if (queue.length >= MAX_BATCH) {
    void flush();
  }
}

export default {
  start,
  stop,
  enqueue,
};
