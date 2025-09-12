#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opts = { input: 'data/analytics.json', output: 'exports/out.csv', filter: undefined };
for (const a of argv) {
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

let raw;
try {
  raw = fs.readFileSync(inPath, 'utf-8');
} catch (e) {
  console.error('failed to read input file', e);
  process.exit(1);
}

let store;
try {
  store = JSON.parse(raw);
} catch (e) {
  console.error('failed to parse input JSON', e);
  process.exit(1);
}

const events = Array.isArray(store.events) ? store.events : store.events || [];
let filtered = events;
if (opts.filter) {
  const [k, v] = opts.filter.split('=');
  if (k) filtered = events.filter((ev) => String(ev[k]) === String(v));
}

const outPath = path.join(root, opts.output);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const headerKeys = Array.from(filtered.reduce((acc, ev) => {
  Object.keys(ev).forEach((k) => acc.add(k));
  return acc;
}, new Set()));

const header = headerKeys.join(',') + '\n';
const rows = filtered.map((e) => headerKeys.map((k) => String(e[k] ?? '')).join(',')).join('\n');

try {
  fs.writeFileSync(outPath, header + rows);
  console.log('exported', filtered.length, 'events to', outPath);
} catch (e) {
  console.error('failed to write output', e);
  process.exit(1);
}
