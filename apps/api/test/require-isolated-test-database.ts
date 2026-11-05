/**
 * Guard for integration tests that mutate PostgreSQL.
 *
 * This must run before PrismaClient is constructed.
 */
export function requireIsolatedTestDatabase(): string {
  const testUrl = process.env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error(
      'TEST_DATABASE_URL must be explicitly configured for database integration tests.',
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(testUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL is not a valid URL.');
  }

  if (!['postgresql:', 'postgres:'].includes(parsed.protocol)) {
    throw new Error('TEST_DATABASE_URL must use PostgreSQL.');
  }

  const databaseName = decodeURIComponent(
    parsed.pathname.replace(/^\//, ''),
  );

  if (!/(^|[_-])(test|testing)([_-]|$)/i.test(databaseName)) {
    throw new Error(
      'Integration tests require a dedicated database with test in its name.',
    );
  }

  const activeUrl = process.env.DATABASE_URL;

  if (activeUrl && activeUrl !== testUrl) {
    let active: URL;

    try {
      active = new URL(activeUrl);
    } catch {
      throw new Error('DATABASE_URL is not a valid URL.');
    }

    if (
      active.hostname === parsed.hostname &&
      active.port === parsed.port &&
      active.pathname === parsed.pathname
    ) {
      throw new Error(
        'TEST_DATABASE_URL points to the same database as DATABASE_URL.',
      );
    }
  }

  return testUrl;
}
