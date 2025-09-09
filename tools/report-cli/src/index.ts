#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { gatherGitHub } from './connectors/github.js';
import { gatherVercel } from './connectors/vercel.js';
import { gatherSupabase } from './connectors/supabase.js';
import { gatherStripe } from './connectors/stripe.js';
import { gatherSentry } from './connectors/sentry.js';
import { renderMarkdown } from './formatters/md.js';

async function run(projectPath: string, out: string) {
  const report: Record<string, unknown> = {
    id: path.basename(projectPath),
    meta: { name: path.basename(projectPath), path: projectPath, owner: '', lastUpdated: new Date().toISOString() },
  repo: await gatherGitHub(projectPath),
  hosting: await gatherVercel(),
  db: await gatherSupabase(),
  monetization: await gatherStripe(),
  monitoring: await gatherSentry(),
    summary: { health: 'unknown', risks: [], wins: [], milestones: [] }
  };

  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('Report written to', out);
  try {
    const md = renderMarkdown(report);
    const mdPath = out.replace(/\.json$/i, '.md');
    fs.writeFileSync(mdPath, md);
    console.log('Markdown report written to', mdPath);
  } catch {
    // ignore formatter errors
  }
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: report-cli <project-path> [out.json]');
  process.exit(1);
}
const projectPath = args[0] as string;
const out = (args[1] || path.join(process.cwd(), `${path.basename(projectPath)}-report.json`)) as string;
run(projectPath, out).catch(() => { process.exit(2); });
