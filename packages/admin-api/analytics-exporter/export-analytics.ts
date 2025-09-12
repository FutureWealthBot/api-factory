#!/usr/bin/env node

// Simple analytics exporter with filter support

import fs from 'fs';
import path from 'path';

type EventRecord = { [key: string]: unknown };

const args = process.argv.slice(2);
const opts: { input: string; output: string; filter?: string } = {
  input: 'data/analytics.json',
  output: 'exports/out.csv',
};

for (const a of args) {
  if (a.startsWith('--input=')) opts.input = a.split('=')[1];
  if (a.startsWith('--output=')) opts.output = a.split('=')[1];
  if (a.startsWith('--filter=')) opts.filter = a.split('=')[1];
}

const root = process.cwd();
const inPath = path.join(root, opts.input);
if (!fs.existsSync(inPath)) {
  console.error('input file not found', inPath);
  process.exit(1);
}

let raw: string;
try {
  raw = fs.readFileSync(inPath, 'utf-8');
} catch (e) {
  console.error('failed to read input file', e);
  process.exit(1);
}

let events: EventRecord[];
try {
  events = JSON.parse(raw) as EventRecord[];
} catch (e) {
  console.error('failed to parse input JSON', e);
  process.exit(1);
}

if (opts.filter) {
  const [k, v] = opts.filter.split('=');
  if (k) {
    events = events.filter((ev) => String(ev[k]) === String(v));
  }
}

const outPath = path.join(root, opts.output);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const headerKeys = Array.from(
  events.reduce((acc, ev) => {
    Object.keys(ev).forEach((k) => acc.add(k));
    return acc;
  }, new Set<string>()),
);

const header = headerKeys.join(',') + '\n';
const rows = events
  .map((e) => headerKeys.map((k) => String(e[k] ?? '')).join(','))
  .join('\n');

try {
  fs.writeFileSync(outPath, header + rows);
  console.log('exported', events.length, 'events to', outPath);
} catch (e) {
  console.error('failed to write output', e);
  process.exit(1);
}
