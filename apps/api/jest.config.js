/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  testRegex: '.*\\.(spec|integration\\.spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['/main.ts$'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  testTimeout: 30000,
};
