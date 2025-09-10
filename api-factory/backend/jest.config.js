module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.test.ts'],
  // map runtime .js imports in tests to TypeScript sources
  moduleNameMapper: {
    // Only map JS imports that resolve inside this package's `src` directory to TS sources.
    // This avoids rewriting relative imports coming from node_modules (e.g. react-is internal cjs files).
    '^(.*\\/src\\/.*)\\.js$': '$1.ts'
  },
  // allow transforming ESM packages (whitelist uuid)
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)']
};
