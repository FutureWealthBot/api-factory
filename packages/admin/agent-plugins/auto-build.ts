// Auto Build Plugin
// Watches for file changes and triggers builds or scaffolding automatically.

import chokidar from 'chokidar';
import { exec } from 'child_process';

export function activateAutoBuild() {
  console.log('🔄 Auto Build Activated! Watching for changes...');
  const watcher = chokidar.watch(['../agent-templates', '../src', '../public'], {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });
  watcher.on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    // Example: Run typecheck, lint, or build
    exec('pnpm run typecheck && pnpm run lint && pnpm run build', (err, stdout, stderr) => {
      if (err) {
        console.error('Build failed:', stderr);
      } else {
        console.log('Build succeeded:', stdout);
      }
    });
  });
}
