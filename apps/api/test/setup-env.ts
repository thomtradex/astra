import fs from 'node:fs';
import path from 'node:path';

function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  const result: Record<string, string> = {};

  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2];
    if (key === undefined || rawValue === undefined) continue;

    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

const root = path.resolve(__dirname, '../../..');
const candidates = [
  path.join(root, '.env'),
  path.join(root, 'packages/database/.env'),
  path.join(root, 'apps/api/.env'),
];

const fileEnv = candidates.reduce<Record<string, string>>(
  (acc, file) => ({ ...acc, ...readEnvFile(file) }),
  {},
);

const databaseUrl = process.env.DATABASE_URL || fileEnv.DATABASE_URL || fileEnv.TEST_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for integration tests. Set it in the environment or local .env.',
  );
}

if (databaseUrl.includes('CHANGE_ME') || databaseUrl.includes('CHANGE_PASSWORD')) {
  throw new Error(
    'DATABASE_URL points to a placeholder credential. Configure the local database credentials before running integration tests.',
  );
}

process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = 'test';
