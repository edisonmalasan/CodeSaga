import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executionRequestSchema, integrationCapabilitiesSchema } from '../src';

test('unconfigured capability contract cannot advertise a live provider or runtime', () => {
  const value = { identity: { available: false, status: 'not_configured' }, execution: { available: false, status: 'not_configured', runtimes: [] } };
  assert.equal(integrationCapabilitiesSchema.safeParse(value).success, true);
  assert.equal(integrationCapabilitiesSchema.safeParse({ ...value, identity: { available: true, status: 'configured' } }).success, false);
  assert.equal(integrationCapabilitiesSchema.safeParse({ ...value, execution: { ...value.execution, runtimes: ['python'] } }).success, false);
});

test('provisional execution requests reject unsupported runtimes, paths, sizes and reward claims', () => {
  const value = { runtime: 'python', content: { id: 'b3000000-0000-4000-8000-000000000001', version: 1 }, entry: 'main.py', files: [{ path: 'main.py', source: 'print("Hello")' }] };
  assert.equal(executionRequestSchema.safeParse(value).success, true);
  for (const invalid of [
    { ...value, runtime: 'shell' }, { ...value, entry: '../main.py' },
    { ...value, files: [{ path: '../main.py', source: 'pass' }] },
    { ...value, files: [{ path: 'main.py', source: 'a'.repeat(32001) }] },
    { ...value, files: [] }, { ...value, xp: 1000 },
  ]) assert.equal(executionRequestSchema.safeParse(invalid).success, false);
});
