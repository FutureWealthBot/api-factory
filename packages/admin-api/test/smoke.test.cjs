const fs = require('fs');
const path = require('path');
test('package.json has name and version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  expect(pkg.name).toBeDefined();
  expect(pkg.version).toBeDefined();
});
