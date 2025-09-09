#!/usr/bin/env node
import { execSync } from 'child_process';

// Simple script to create labels in the current GitHub repo.
// Usage: GITHUB_TOKEN=ghp_xxx node scripts/create-labels.mjs

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN env required');
  process.exit(1);
}

function repoFromEnvOrGit() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const remote = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    // remote can be git@github.com:owner/repo.git or https://github.com/owner/repo.git
    const m = remote.match(/[:/]([^/]+\/[^/]+)(?:\.git)?$/);
    if (m) return m[1];
  } catch (e) {
    // ignore
  }
  return null;
}

const repo = repoFromEnvOrGit();
if (!repo) {
  console.error('Could not determine repo owner/name. Set GITHUB_REPOSITORY or run from a git clone with remote.origin.url set.');
  process.exit(1);
}

const [owner, repoName] = repo.split('/');

const desired = [
  { name: 'needs-roadmap', color: 'd93f0b', description: 'PR needs a roadmap reference (added by PR assistant)' }
];

async function listLabels() {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/labels`, {
    headers: { Authorization: `token ${token}`, 'User-Agent': 'api-factory-script' },
  });
  if (!res.ok) throw new Error(`listLabels failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function createLabel(l) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/labels`, {
    method: 'POST',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'api-factory-script' },
    body: JSON.stringify(l),
  });
  if (!res.ok) throw new Error(`createLabel failed: ${res.status} ${res.statusText} - ${await res.text()}`);
  return res.json();
}

async function main() {
  const existing = await listLabels();
  const existingNames = new Set(existing.map((x) => x.name));
  for (const lbl of desired) {
    if (!existingNames.has(lbl.name)) {
      console.log('Creating label', lbl.name);
      await createLabel(lbl);
    } else {
      console.log('Label exists:', lbl.name);
    }
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
