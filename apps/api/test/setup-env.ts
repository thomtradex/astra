process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??=
  'postgresql://astra:astra_dev_password@localhost:5432/astra?schema=public';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-minimum-32-characters-long';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
