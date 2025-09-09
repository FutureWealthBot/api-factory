import { readFileSync } from 'fs';
import { join } from 'path';

export function getTrack(): string {
  if (process.env.TRACK && process.env.TRACK.trim().length > 0) return process.env.TRACK.trim();
  try {
    const p = join(process.cwd(), 'TRACK');
    const v = readFileSync(p, 'utf8').trim();
    if (v) return v;
  } catch {
    // ignore
  }
  return 'unknown';
}
