const base = require('./jest.config.js');

module.exports = {
  ...base,
  rootDir: '.',
  setupFiles: [],
  testRegex: undefined,
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/require-isolated-test-database.spec.ts',
  ],
};
