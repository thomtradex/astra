/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },

// Integration tests cross Supertest/Nest HTTP boundaries where the current
// type definitions expose response bodies and servers as `any`.
{
  files: ['test/**/*.ts'],
  rules: {
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
  },
},

];
