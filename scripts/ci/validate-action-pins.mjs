/**
 * Enforce that GitHub Actions are pinned to full commit SHAs, not tags.
 * Allowed formats: uses: owner/name@<40-hex-sha>
 * Allowlist specific actions (by file) when absolutely necessary.
 */
import fs from 'fs'; import path from 'path';

const wfDir = '.github/workflows';
const allow = new Map([
  // Example: ['deploy.yml', ['aws-actions/configure-aws-credentials']] // if you must allow tag pin temporarily
]);

const files = fs.readdirSync(wfDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
let bad = [];
for (const f of files) {
  const txt = fs.readFileSync(path.join(wfDir, f), 'utf8');
  const re = /^\s*-\s*uses:\s*([a-z0-9_.\-]+\/[a-z0-9_.\-]+)@([^\s#]+)\s*$/gim;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const action = m[1], ref = m[2];
    const isSHA = /^[0-9a-f]{40}$/.test(ref);
    const allowed = (allow.get(f) || []).includes(action);
    if (!isSHA && !allowed) bad.push(`${f}: ${action}@${ref}`);
  }
}
if (bad.length) {
  console.error('❌ Unpinned actions detected (use full 40-char commit SHAs):');
  for (const line of bad) console.error(' -', line);
  console.error('\nHint: Use `gh api` to fetch the latest commit SHA for a tag:');
  console.error('  gh api repos/{owner}/{repo}/actions/runners/downloads  # or');
  console.error('  gh api repos/{owner}/{repo}/git/refs/tags/vX | jq .object.sha');
  process.exit(1);
}
console.log('✅ All actions pinned to SHAs (or explicitly allowlisted).');
