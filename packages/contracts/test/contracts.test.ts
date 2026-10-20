import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiErrorSchema, healthSchema } from '../src';

test('public responses reject extra fields and invalid service identities', () => {
  assert.equal(healthSchema.safeParse({ status: 'ok', service: 'codesaga-api' }).success, true);
  assert.equal(healthSchema.safeParse({ status: 'ok', service: 'other' }).success, false);
  assert.equal(healthSchema.safeParse({ status: 'ok', service: 'codesaga-api', secret: 'private' }).success, false);
  assert.equal(apiErrorSchema.safeParse({ error: { code: 'BAD_REQUEST', message: 'Invalid request', requestId: 'test-1' } }).success, true);
  assert.equal(apiErrorSchema.safeParse({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }).success, false);
});
