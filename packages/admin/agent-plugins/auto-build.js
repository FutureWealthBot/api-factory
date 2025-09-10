// Auto Build Plugin
// Watches for file changes and triggers light-weight diagnostics or full builds.
// Optimizations: debounce rapid changes, ignore noisy paths, prevent overlapping runs,
// and allow running locally via AUTO_BUILD_RUN=1.
import chokidar from 'chokidar';
import { spawn } from 'child_process';
export function activateAutoBuild(opts) {
    const paths = opts?.paths ?? ['../agent-templates', '../src', '../public'];
    const debounceMs = (opts?.debounceMs ?? Number(process.env.AUTO_BUILD_DEBOUNCE_MS)) || 500;
    const cmd = opts?.cmd ?? process.env.AUTO_BUILD_COMMAND ?? 'pnpm run typecheck && pnpm run lint && pnpm run build';
    const ignored = opts?.ignored ?? [/(^|[\\/\\\\])\./, 'node_modules', 'dist', 'public/dist'];
    console.log(`🔄 Auto Build Activated — watching ${paths.join(', ')} (debounce ${debounceMs}ms)`);
    let timer = null;
    let running = null;
    let queued = false;
    function runCommand() {
        if (running) {
            // If a run is already active, queue one more run and kill the current to make progress.
            queued = true;
            console.log('⚠️  Build already running — will restart after current job finishes');
            // politely kill the running process
            try {
                running.kill('SIGTERM');
            }
            catch (e) {
                // ignore
            }
            return;
        }
        console.log(`▶️  Running: ${cmd}`);
        // Use a shell to keep the original command string semantics (&& chaining)
        running = spawn(cmd, { shell: true, stdio: 'inherit' });
        running.on('exit', (code, signal) => {
            running = null;
            if (code === 0) {
                console.log('✅ Build finished successfully');
            }
            else {
                console.error(`❌ Build exited with code=${code} signal=${signal}`);
            }
            if (queued) {
                queued = false;
                // small delay to settle file changes
                setTimeout(runCommand, 200);
            }
        });
    }
    const watcher = chokidar.watch(paths, { ignored, persistent: true, ignoreInitial: true });
    const onChange = (filePath) => {
        const now = new Date().toISOString();
        console.log(`[${now}] change detected: ${filePath}`);
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            runCommand();
        }, debounceMs);
    };
    watcher.on('add', onChange);
    watcher.on('change', onChange);
    watcher.on('unlink', onChange);
    watcher.on('error', (err) => console.error('Watcher error:', err));
    return {
        close: () => watcher.close(),
    };
}
// Convenience local runner: set AUTO_BUILD_RUN=1 to execute directly with `npx tsx`.
if (process.env.AUTO_BUILD_RUN === '1') {
     
    (async () => {
        activateAutoBuild();
    })();
}
