import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readConfig } from '../src/config';

const base = {
  DATABASE_URL: 'postgresql://codesaga:local-password@127.0.0.1:5432/codesaga',
  CORS_ORIGINS: 'http://localhost:3000',
};

test('environment defaults and explicit origin allowlist', () => {
  const config = readConfig({ ...base, CORS_ORIGINS: 'http://localhost:3000, http://127.0.0.1:3000' });
  assert.equal(config.PORT, 4000);
  assert.equal(config.NODE_ENV, 'development');
  assert.deepEqual(config.CORS_ORIGINS, ['http://localhost:3000', 'http://127.0.0.1:3000']);
});

test('missing required settings fail without disclosing values', () => {
  assert.throws(() => readConfig({}), /^Error: Invalid API environment: CORS_ORIGINS, DATABASE_URL$/);
  assert.throws(() => readConfig({ ...base, DATABASE_URL: 'https://private:secret@example.com/db' }),
    /^Error: Invalid API environment: DATABASE_URL$/);
});

test('invalid settings fail closed', () => {
  for (const PORT of ['', '0', '-1', '65536', '3.5', '4000x']) {
    assert.throws(() => readConfig({ ...base, PORT }), /PORT/);
  }
  for (const CORS_ORIGINS of ['', '*', 'null', 'http://localhost:3000/path', 'https://a.example/',
    'http://user:password@localhost:3000', 'file:///tmp']) {
    assert.throws(() => readConfig({ ...base, CORS_ORIGINS }), /CORS_ORIGINS/);
  }
  for (const DATABASE_URL of ['', 'not-a-url', 'postgresql://localhost', 'postgresql://u@localhost/db#fragment']) {
    assert.throws(() => readConfig({ ...base, DATABASE_URL }), /DATABASE_URL/);
  }
  assert.throws(() => readConfig({ ...base, NODE_ENV: 'unknown' }), /NODE_ENV/);
  assert.throws(() => readConfig({ ...base, HOST: 'example.com' }), /HOST/);
  assert.throws(() => readConfig({ ...base, NODE_ENV: 'production' }), /CORS_ORIGINS/);
  assert.equal(readConfig({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'https://app.example' }).NODE_ENV, 'production');
});
