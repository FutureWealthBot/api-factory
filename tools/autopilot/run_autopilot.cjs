#!/usr/bin/env node
/*
 Simple autopilot script for MVP sprint mode.
 - Creates labels + milestone if missing
 - Creates a small set of pre-defined MVP issues (idempotent)
 - Guardrails: requires human approval label `autopilot-allow` to perform destructive ops (not used here)
 - AUTO_DEBUG env enables verbose logging
*/

const { execSync } = require('child_process');

function sh(cmd, opts = {}){
  if (process.env.AUTO_DEBUG === 'true') console.log('> CMD:', cmd);
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
    if (process.env.AUTO_DEBUG === 'true') console.log(out);
    return out;
  } catch (err) {
    console.error('Command failed:', cmd, err.message);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

const repo = process.env.GITHUB_REPOSITORY || 'FutureWealthBot/api-factory';

function ensureLabels(labels){
  labels.forEach(l => {
    try{
      sh(`gh label create --repo ${repo} ${JSON.stringify(l.name)} --color ${l.color || '1d76db'} --description ${JSON.stringify(l.desc||'autocreated')}`);
    }catch(e){
      console.log('label create skipped or exists:', l.name);
    }
  });
}

function ensureMilestone(title, desc){
  try{
    const out = sh(`gh api -X POST /repos/${repo}/milestones -f title=${JSON.stringify(title)} -f description=${JSON.stringify(desc)}`);
    return JSON.parse(out).number;
  }catch(e){
    // try to find existing
    try{
      const list = sh(`gh api /repos/${repo}/milestones`);
      const ms = JSON.parse(list).find(m => m.title === title);
      return ms ? ms.number : null;
    }catch(e2){
      throw e2;
    }
  }
}

function createIssue(title, body, labels=[], milestone=null){
  const labelArg = labels.length ? `--label ${labels.join(',')}` : '';
  const milestoneArg = milestone ? `--milestone ${JSON.stringify(milestone)}` : '';
  try{
    const out = sh(`gh issue create --repo ${repo} --title ${JSON.stringify(title)} --body ${JSON.stringify(body)} ${labelArg} ${milestoneArg}`);
    console.log('Created:', out.trim());
  }catch(e){
    console.log('Issue create likely failed (exists or labels missing):', title);
  }
}

async function main(){
  console.log('Autopilot mode:', process.env.AUTOPILOT_MODE || 'normal');
  const labels = [
    {name:'mvp', color:'1d76db'}, {name:'backend', color:'0e8a16'}, {name:'tests'}, {name:'billing'}, {name:'admin'}, {name:'frontend'}, {name:'infra'}, {name:'ci'}, {name:'security'}, {name:'docs'}
  ];
  ensureLabels(labels);

  const msNumber = ensureMilestone('MVP — 90 days','Milestone for MVP 90-day plan');
  console.log('Milestone number:', msNumber);

  // small set of issues (idempotent-ish)
  const issues = [
    {
      title: 'Implement health/ping/echo endpoints + auth middleware',
      body: 'Implement endpoints: /_api/healthz, /api/v1/hello/ping, /api/v1/hello/echo. Add simple API-key auth middleware and tests. Acceptance: inject tests pass and endpoints respond 200.',
      labels: ['mvp','backend','tests']
    },
    {title:'Implement POST /api/v1/actions + rate-limit enforcement', body:'Add guarded Actions endpoint with API key/Bearer auth and per-key rate limiting. Include logging and tests. Acceptance: rate limit enforced in tests.', labels:['mvp','backend']},
    {title:'Add Stripe webhook endpoint + plan→quota logic (idempotent)', body:'Implement Stripe webhook handler and plan→quota mapping. Ensure idempotent processing and tests.', labels:['mvp','billing','backend']}
  ];

  for(const it of issues){
    createIssue(it.title, it.body, it.labels, 'MVP — 90 days');
  }

  console.log('Autopilot run complete.');
}

main();
