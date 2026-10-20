import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { UnavailableIdentitySession, UnavailableIsolatedExecution, IntegrationUnavailableError } from '../src/integrations/ports';

test('identity port rejects anonymous and forged credentials without creating a principal', async () => {
  const identity = new UnavailableIdentitySession();
  for (const credentials of [{}, { cookie: 'forged', authorization: 'Bearer secret' }]) {
    await assert.rejects(identity.readSession(credentials), (error: unknown) =>
      error instanceof IntegrationUnavailableError && error.integration === 'identity');
  }
  assert.deepEqual(identity.capabilities, { available: false, status: 'not_configured' });
  assert(Object.isFrozen(identity.capabilities));
});

test('execution port rejects a snapshot without producing a job or successful result', async () => {
  const execution = new UnavailableIsolatedExecution();
  await assert.rejects(execution.start({ runtime: 'python',
    content: { id: 'b1000000-0000-4000-8000-000000000001', version: 1 }, entry: 'main.py',
    files: [{ path: 'main.py', source: 'print("never run")' }] }), (error: unknown) =>
    error instanceof IntegrationUnavailableError && error.integration === 'execution');
  assert.deepEqual(execution.capabilities, { available: false, status: 'not_configured', runtimes: [] });
  assert(Object.isFrozen(execution.capabilities.runtimes));
});
