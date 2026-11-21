'use strict';

function fail() {
  throw new Error(
    'ASTRA integration tests blocked: isolated database authorization required.'
  );
}

if (
  process.env.NODE_ENV !== 'test' ||
  process.env.ASTRA_ALLOW_ISOLATED_TESTS !== 'true'
) {
  fail();
}

const testUrl = process.env.TEST_DATABASE_URL;
const activeUrl = process.env.DATABASE_URL;

if (
  !testUrl ||
  !activeUrl ||
  testUrl !== activeUrl
) {
  fail();
}

if (
  !process.env.ASTRA_TEST_DATABASE_ID ||
  process.env.ASTRA_TEST_DATABASE_ID !==
    process.env.ASTRA_EXPECTED_TEST_DATABASE_ID
) {
  fail();
}

let parsed;

try {
  parsed = new URL(testUrl);
} catch {
  fail();
}

if (
  !['postgresql:', 'postgres:'].includes(parsed.protocol) ||
  !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
  !parsed.port ||
  !/(test|cert)/i.test(parsed.pathname)
) {
  fail();
}
