#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const roadmapDir = path.join(repoRoot, 'docs', 'roadmap');
const releasesDir = path.join(repoRoot, 'RELEASES');
const outputDir = path.join(__dirname, 'output');
const outFile = path.join(outputDir, 'ROADMAP_PROPOSAL.md');

function readFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .filter(f => !ext || f.endsWith(ext))
    .map(f => ({name: f, path: path.join(dir, f), content: fs.readFileSync(path.join(dir, f), 'utf8')}));
}

function summarize(text, maxLines = 40) {
  const lines = text.split('\n').slice(0, maxLines);
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});

  const roadmapFiles = readFiles(roadmapDir, '.md');
  const releaseFiles = readFiles(releasesDir, '.md');

  let out = [];
  out.push('# ROADMAP PROPOSAL (auto-generated)\n');
  out.push('This file aggregates roadmap and release notes to suggest next items. Edit before publishing.\n');

  if (roadmapFiles.length) {
    out.push('## Existing roadmap documents\n');
    roadmapFiles.forEach(f => {
      out.push('### ' + f.name + '\n');
      out.push('```\n' + summarize(f.content, 30) + '\n```\n');
    })
  }

  if (releaseFiles.length) {
    out.push('## Recent release notes\n');
    releaseFiles.slice(0,5).forEach(f => {
      out.push('### ' + f.name + '\n');
      out.push('```\n' + summarize(f.content, 20) + '\n```\n');
    })
  }

  out.push('## Suggested next items\n');
  out.push('- Consolidate feature requests from `docs/roadmap` and `RELEASES/` into milestone-backed issues.');
  out.push('- Prioritize security and compliance tasks from the compliance docs.');
  out.push('- Publish a 90-day roadmap with measurable milestones and owners.');
  out.push('- Run a cross-team review of the proposed roadmap.\n');

  fs.writeFileSync(outFile, out.join('\n'));
  console.log('Wrote', outFile);
}

main();
