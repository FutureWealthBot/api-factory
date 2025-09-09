import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const KEYS_FILE = join(process.cwd(), 'data', 'keys.json');

export type KeyRecord = { key: string; status?: string; quota?: number; plan?: string };

async function readKeys(): Promise<Record<string, KeyRecord>> {
  try {
    const raw = await fs.readFile(KEYS_FILE, 'utf8');
    return JSON.parse(raw) as Record<string, KeyRecord>;
  } catch {
    return {};
  }
}

export async function validateKey(key: string | undefined) {
  if (!key) return null;
  const m = await readKeys();
  const rec = m[key];
  if (!rec) return null;
  if (rec.status !== 'active') return null;
  return rec;
}

export function constantTimeEqual(a?: string, b?: string) {
  if (!a || !b) return false;
  const ka = Buffer.from(a);
  const kb = Buffer.from(b);
  if (ka.length !== kb.length) return false;
  return crypto.timingSafeEqual(ka, kb);
}

export default { validateKey };
