export type KeyRecord = { key: string; status?: string; quota?: number; plan?: string; updatedAt?: string };

// Constant-time string compare to avoid timing attacks
export function constantTimeEqual(a?: string, b?: string) {
  if (!a || !b) return false;
  // Compare by char code to avoid depending on TextEncoder/Buffer in different runtimes
  if (a!.length !== b!.length) return false;
  let res = 0;
  for (let i = 0; i < a!.length; i++) {
    res |= a!.charCodeAt(i) ^ b!.charCodeAt(i);
  }
  return res === 0;
}

export function validateKeyFormat(key?: string) {
  if (!key || typeof key !== 'string') return false;
  // simple heuristic: alphanumeric with dashes, length between 16 and 64
  return /^[A-Za-z0-9\-]{16,64}$/.test(key);
}

export function findKeyRecord(map: Record<string, KeyRecord>, key?: string): KeyRecord | null {
  if (!key) return null;
  const rec = map[key];
  return rec ?? null;
}
