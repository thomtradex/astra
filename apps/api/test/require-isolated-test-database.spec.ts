import { requireIsolatedTestDatabase } from './require-isolated-test-database';

describe('requireIsolatedTestDatabase', () => {
  const originalTestUrl = process.env.TEST_DATABASE_URL;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalTestUrl === undefined) {
      delete process.env.TEST_DATABASE_URL;
    } else {
      process.env.TEST_DATABASE_URL = originalTestUrl;
    }

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('rejects a missing test database URL', () => {
    delete process.env.TEST_DATABASE_URL;

    expect(() => requireIsolatedTestDatabase()).toThrow(
      'TEST_DATABASE_URL must be explicitly configured',
    );
  });

  it('rejects a production-like database name', () => {
    process.env.TEST_DATABASE_URL =
      'postgresql://example:example@127.0.0.1:5432/astra';
    delete process.env.DATABASE_URL;

    expect(() => requireIsolatedTestDatabase()).toThrow(
      'dedicated database',
    );
  });

  it('rejects a non-PostgreSQL URL', () => {
    process.env.TEST_DATABASE_URL =
      'mysql://example:example@127.0.0.1:3306/astra_test';
    delete process.env.DATABASE_URL;

    expect(() => requireIsolatedTestDatabase()).toThrow(
      'must use PostgreSQL',
    );
  });

  it('accepts a dedicated test database URL', () => {
    const url =
      'postgresql://example:example@127.0.0.1:5432/astra_test';

    process.env.TEST_DATABASE_URL = url;
    delete process.env.DATABASE_URL;

    expect(requireIsolatedTestDatabase()).toBe(url);
  });

  it('rejects the same database as the active database', () => {
    process.env.TEST_DATABASE_URL =
      'postgresql://test:test@127.0.0.1:5432/astra_test';

    process.env.DATABASE_URL =
      'postgresql://other:other@127.0.0.1:5432/astra_test';

    expect(() => requireIsolatedTestDatabase()).toThrow(
      'same database',
    );
  });
});
