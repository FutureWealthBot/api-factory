module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  // Setup files for environment variables and mocks
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};