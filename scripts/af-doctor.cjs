/**
 * API-Factory Doctor: prints a concise health report.
 */
const fs = require('fs');
const has = (p) => fs.existsSync(p);
const out = [];
out.push(`node: ${process.version}`);
out.push(`has pnpm-lock.yaml: ${has('pnpm-lock.yaml')}`);
out.push(`has tsconfig.base.json: ${has('tsconfig.base.json')}`);
out.push(`has tsconfig.node.json: ${has('tsconfig.node.json')}`);
out.push(`has tsconfig.web.json: ${has('tsconfig.web.json')}`);
out.push(`has eslint: ${has('.eslintrc.cjs')}`);
out.push(`has prettier: ${has('.prettierrc')}`);
out.push(`has CI workflow: ${has('.github/workflows/ci.yml')}`);
console.log(out.join('\n'));
