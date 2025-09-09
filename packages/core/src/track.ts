import { readFileSync } from 'fs';
import { join } from 'path';

export function getTrack(): string {
  // prefer environment variable, fallback to top-level TRACK file
  if (process.env.TRACK && process.env.TRACK.trim().length > 0) return process.env.TRACK.trim();
  try {
    const root = join(process.cwd());
    const p = join(root, 'TRACK');
    const v = readFileSync(p, 'utf8').trim();
    if (v) return v;
  } catch {
    // ignore
  }
  return 'unknown';
}
