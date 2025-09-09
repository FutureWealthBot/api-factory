#!/usr/bin/env node
// Small wrapper to call tsc while stripping an accidental "--if-present" arg
import { spawnSync } from 'child_process';

const args = process.argv.slice(2).filter(a => a !== '--if-present');

// default to reading from local tsconfig
if (args.length === 0) args.push('-p', 'tsconfig.json');

const res = spawnSync('npx', ['tsc', ...args], { stdio: 'inherit' });
process.exit(res.status ?? 0);
