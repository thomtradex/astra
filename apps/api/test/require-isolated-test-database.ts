/**
 * Central safety guard for isolated PostgreSQL integration tests.
 *
 * This function performs configuration validation only.
 * Callers must additionally verify PostgreSQL identity before
 * performing destructive database operations.
 */
export function requireIsolatedTestDatabase(): string {
  if (
    process.env.NODE_ENV !== 'test' ||
    process.env.ASTRA_ALLOW_ISOLATED_TESTS !== 'true'
  ) {
    throw new Error('Isolated test authorization required.');
  }

  const testUrl = process.env.TEST_DATABASE_URL;
  const activeUrl = process.env.DATABASE_URL;

  if (!testUrl || !activeUrl || testUrl !== activeUrl) {
    throw new Error('Explicit matching test database URLs required.');
  }

  const expectedId = process.env.ASTRA_EXPECTED_TEST_DATABASE_ID;
  const actualId = process.env.ASTRA_TEST_DATABASE_ID;

  if (
    !expectedId ||
    !actualId ||
    expectedId !== actualId ||
    !/^[a-z0-9][a-z0-9_-]{5,63}$/.test(actualId)
  ) {
    throw new Error('Test database certification identity mismatch.');
  }

  let parsed: URL;

  try {
    parsed = new URL(testUrl);
  } catch {
    throw new Error('Invalid test database URL.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
    parsed.hostname !== '127.0.0.1'
  ) {
    throw new Error('Only local PostgreSQL is authorized.');
  }

  const port = Number(parsed.port);

  if (
    !Number.isInteger(port) ||
    port < 1024 ||
    port > 65535
  ) {
    throw new Error('Explicit non-privileged PostgreSQL port required.');
  }

  const database = decodeURIComponent(
    parsed.pathname.slice(1)
  );

  const username = decodeURIComponent(parsed.username);

  if (
    !/^[a-z][a-z0-9_]{5,63}$/.test(database) ||
    !/^[a-z][a-z0-9_]{5,63}$/.test(username) ||
    !parsed.password
  ) {
    throw new Error('Invalid test database identity or credentials.');
  }

  if (!/(^|[_-])(test|cert)([_-]|$)/i.test(database)) {
    throw new Error('Dedicated test or certification database required.');
  }

  const forbidden = /(^|[_-])(prod|production|live|main)([_-]|$)/i;

  if (forbidden.test(database) || forbidden.test(username)) {
    throw new Error('Production-like database identity rejected.');
  }

  if (
    parsed.searchParams.get('schema') !== 'public' ||
    [...parsed.searchParams.keys()].length !== 1
  ) {
    throw new Error('Only the public test schema is authorized.');
  }

  return testUrl;
}
