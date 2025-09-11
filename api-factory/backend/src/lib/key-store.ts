import { promises as fs } from 'fs';
import { join } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DATA_DIR = join(process.cwd(), 'data');
const KEYS_FILE = join(DATA_DIR, 'keys.json');

export type KeyRecord = {
  key: string;
  plan?: string;
  quota?: number;
  status?: 'active' | 'suspended' | 'past_due' | 'revoked' | 'unknown';
  updatedAt?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
}

const USE_IN_MEMORY = process.env.USE_IN_MEMORY_STORE === 'true';

class InMemoryStore<T extends Record<string, unknown>> {
  private map: Record<string, T> = {} as Record<string, T>;
  async get(k: string) { return (this.map as Record<string, T>)[k] ?? null; }
  async put(k: string, v: T) { (this.map as Record<string, T>)[k] = v; }
  async delete(k: string) { delete (this.map as Record<string, T>)[k]; }
  async list() { return { ...this.map } as Record<string, T>; }
}

const inMemoryStore = USE_IN_MEMORY ? new InMemoryStore<KeyRecord>() : null;

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(KEYS_FILE);
  } catch {
    await fs.writeFile(KEYS_FILE, JSON.stringify({}), 'utf8');
  }
}

export async function readKeys(): Promise<Record<string, KeyRecord>> {
  if (inMemoryStore) {
    return await inMemoryStore.list();
  }
  if (supabase) {
    const { data: rows, error } = await supabase.from('api_keys').select('*');
    if (error) throw error;
    const out: Record<string, KeyRecord> = {};
    const rowsArr = rows as unknown[] | null;
    if (rows && Array.isArray(rows)) {
      for (const r of rowsArr!) {
        const row = r as Record<string, unknown>;
        const key = String(row['key']);
        out[key] = {
          key,
          plan: row['plan'] as string | undefined,
          quota: typeof row['quota'] === 'number' ? (row['quota'] as number) : undefined,
          status: (row['status'] as KeyRecord['status']) ?? 'unknown',
          updatedAt: row['updated_at'] as string | undefined,
        };
      }
    }
    return out;
  }
  await ensureFile();
  const raw = await fs.readFile(KEYS_FILE, 'utf8');
  try {
    return JSON.parse(raw) as Record<string, KeyRecord>;
  } catch {
    return {};
  }
}

export async function writeKeys(map: Record<string, KeyRecord>) {
  if (inMemoryStore) {
    // replace contents
    const list = map as Record<string, KeyRecord>;
    for (const k of Object.keys(list)) {
      await inMemoryStore.put(k, list[k]);
    }
    return;
  }
  if (supabase) {
    // upsert each key row into supabase table `api_keys`
    for (const k of Object.keys(map)) {
      const rec = map[k];
      if (!rec) continue;
      await supabase.from('api_keys').upsert({ key: rec.key, plan: rec.plan ?? null, quota: rec.quota ?? null, status: rec.status ?? 'unknown' }).select();
    }
    return;
  }
  await ensureFile();
  await fs.writeFile(KEYS_FILE, JSON.stringify(map, null, 2), 'utf8');
}

export async function upsertKey(key: string, patch: Partial<KeyRecord>) {
  if (inMemoryStore) {
    const cur = (await inMemoryStore.get(key)) || { key, status: 'unknown', updatedAt: new Date().toISOString() };
  const next: KeyRecord = { ...(cur as KeyRecord), ...patch, key, updatedAt: new Date().toISOString() };
  await inMemoryStore.put(key, next);
    return next;
  }
  if (supabase) {
    const now = new Date().toISOString();
    const row = { key, plan: patch.plan ?? null, quota: patch.quota ?? null, status: patch.status ?? 'unknown', updated_at: now };
  const { error } = await supabase.from('api_keys').upsert(row).select();
  if (error) throw error;
    return { key: row.key, plan: row.plan ?? undefined, quota: row.quota ?? undefined, status: row.status as KeyRecord['status'], updatedAt: now } as KeyRecord;
  }

  const m = await readKeys();
  const cur = m[key] || { key, status: 'unknown', updatedAt: new Date().toISOString() };
  const next: KeyRecord = { ...cur, ...patch, key, updatedAt: new Date().toISOString() };
  m[key] = next;
  await writeKeys(m);
  return next;
}

export async function getKey(key: string) {
  if (inMemoryStore) {
    return await inMemoryStore.get(key) as KeyRecord | null;
  }
  if (supabase) {
    const { data, error } = await supabase.from('api_keys').select('*').eq('key', key).limit(1).single();
    if (error) return null;
    const row = data as Record<string, unknown>;
    return {
      key: String(row['key']),
      plan: row['plan'] as string | undefined,
      quota: typeof row['quota'] === 'number' ? (row['quota'] as number) : undefined,
      status: (row['status'] as KeyRecord['status']) ?? 'unknown',
      updatedAt: row['updated_at'] as string | undefined,
    } as KeyRecord;
  }
  const m = await readKeys();
  return m[key];
}

export default { readKeys, writeKeys, upsertKey, getKey };
