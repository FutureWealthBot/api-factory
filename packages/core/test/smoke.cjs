const fs = require('fs');
const path = require('path');
try {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.name || !pkg.version) {
    console.error('package.json invalid');
    process.exit(2);
  }
  console.log(`ok: ${pkg.name} ${pkg.version}`);
  process.exit(0);
} catch (err) {
  console.error('smoke test failed:', err && err.stack || err);
  process.exit(3);
}
