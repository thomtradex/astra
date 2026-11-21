import {
  requireIsolatedTestDatabase,
} from './require-isolated-test-database';

if (
  process.env.NODE_ENV !== 'test' ||
  process.env.ASTRA_ALLOW_ISOLATED_TESTS !== 'true'
) {
  throw new Error(
    'Integration setup requires explicit isolated test authorization.',
  );
}

const databaseUrl = requireIsolatedTestDatabase();

if (process.env.DATABASE_URL !== databaseUrl) {
  throw new Error(
    'DATABASE_URL must exactly match TEST_DATABASE_URL.',
  );
}

if (
  !process.env.ASTRA_TEST_DATABASE_ID ||
  process.env.ASTRA_TEST_DATABASE_ID !==
    process.env.ASTRA_EXPECTED_TEST_DATABASE_ID
) {
  throw new Error(
    'Integration database identity authorization failed.',
  );
}

// This setup intentionally does not load .env files.
// Credentials must be supplied by the isolated test runner.
