import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWebEnvironment } from '../src/environment';

test('web configuration requires explicit, credential-free HTTP origins', () => {
  const valid = { API_BASE_URL: 'http://localhost:4000', WEB_ORIGIN: 'http://localhost:3000' };
  assert.deepEqual(parseWebEnvironment(valid), valid);
  for (const value of [undefined, 'not a URL', 'file:///etc/passwd', 'http://user:secret@localhost:4000', 'http://localhost:4000/path']) {
    assert.throws(() => parseWebEnvironment({ ...valid, API_BASE_URL: value }), /API_BASE_URL/);
  }
  assert.throws(() => parseWebEnvironment({}), /WEB_ORIGIN/);
});
