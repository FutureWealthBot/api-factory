import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('live tests guard - runs only when RUN_LIVE_TESTS=1', async () => {
  if (process.env.RUN_LIVE_TESTS !== '1') {
    return expect(true).toBe(true);
  }
  // If RUN_LIVE_TESTS is set, run the legacy live script
  const cp = await import('child_process');
  const exec = cp.execSync || cp.exec;
  const out = cp.execSync('node test-api-live.js', { cwd: __dirname + '/..', stdio: 'inherit' });
  expect(out).toBeDefined();
});
