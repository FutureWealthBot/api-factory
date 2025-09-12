#!/usr/bin/env node
// Remove any __mocks__ folders from dist to avoid Jest duplicate mock warnings
import { rm, readdir } from 'fs/promises';
import { join, basename } from 'path';

const SKIP = new Set(['node_modules', '.git', '.turbo', '.pnpm-store', '.cache', '.next']);

async function removeMocksInDir(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        const name = e.name;
        const p = join(dir, name);
        if (name === '__mocks__') {
          await rm(p, { recursive: true, force: true });
          console.log('removed', p);
        } else {
          await removeMocksInDir(p);
        }
      }
    }
  } catch (err) {
    // ignore permission/not found errors
  }
}

async function findDistAndClean(start = process.cwd()) {
  const entries = await readdir(start, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const name = e.name;
      if (SKIP.has(name)) continue;
      const p = join(start, name);
      if (name === 'dist') {
        await removeMocksInDir(p);
      } else {
        await findDistAndClean(p);
      }
    }
  }
}

(async () => {
  try {
    await findDistAndClean(process.cwd());
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

