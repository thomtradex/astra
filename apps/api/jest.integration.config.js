const base = require('./jest.config.js');

module.exports = {
  ...base,
  rootDir: '.',
  testRegex: undefined,
  setupFiles: [
    '<rootDir>/test/integration-safety-gate.js',
    '<rootDir>/test/setup-env.ts',
  ],
  testMatch: [
    '<rootDir>/test/integration/**/*.integration.spec.ts',
  ],
};
