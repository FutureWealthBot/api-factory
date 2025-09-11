import { KeyRecord } from './keys';

export interface Store<T> {
  get(key: string): Promise<T | null>;
  put(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<Record<string, T>>;
}

export class InMemoryStore<T> implements Store<T> {
  private map: Record<string, T> = {};
  async get(key: string) {
    return this.map[key] ?? null;
  }
  async put(key: string, value: T) {
    this.map[key] = value;
  }
  async delete(key: string) {
    delete this.map[key];
  }
  async list() {
    // return shallow copy
    return { ...this.map };
  }
}

// Supabase-backed store implementation (lightweight wrapper)
// Note: requires @supabase/supabase-js at runtime and env config.
export class SupabaseStore implements Store<KeyRecord> {
  private client: any;
  private table = 'api_keys';
  constructor(supabaseUrl: string, supabaseKey: string) {
    const { createClient } = require('@supabase/supabase-js');
    this.client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }
  async get(key: string) {
    const { data, error } = await this.client.from(this.table).select('*').eq('key', key).limit(1).single();
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
  async put(key: string, value: KeyRecord) {
    await this.client.from(this.table).upsert({ key: value.key, plan: value.plan ?? null, quota: value.quota ?? null, status: value.status ?? 'unknown', updated_at: value.updatedAt ?? new Date().toISOString() }).select();
  }
  async delete(key: string) {
    await this.client.from(this.table).delete().eq('key', key);
  }
  async list() {
    const { data, error } = await this.client.from(this.table).select('*');
    if (error) throw error;
    const out: Record<string, KeyRecord> = {};
    for (const row of data || []) {
      const r = row as Record<string, unknown>;
      const k = String(r['key']);
      out[k] = { key: k, plan: r['plan'] as string | undefined, quota: typeof r['quota'] === 'number' ? (r['quota'] as number) : undefined, status: (r['status'] as KeyRecord['status']) ?? 'unknown', updatedAt: r['updated_at'] as string | undefined };
    }
    return out;
  }
}
