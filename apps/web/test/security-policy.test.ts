import assert from 'node:assert/strict';
import test from 'node:test';
import { webContentSecurityPolicy } from '../src/security-policy';

test('production script policy requires a safe nonce and confines development allowances', () => {
  const nonce = 'A'.repeat(32);
  const production = webContentSecurityPolicy(nonce, false);
  const script = production.split('; ').find((value) => value.startsWith('script-src '))!;
  assert.ok(script.includes(`'nonce-${nonce}'`) && script.includes("'strict-dynamic'"));
  assert.ok(!script.includes("'unsafe-inline'") && !script.includes("'unsafe-eval'"));
  assert.ok(!production.includes(' ws:') && !production.includes(' wss:'));
  const development = webContentSecurityPolicy(nonce, true);
  assert.ok(development.includes("'unsafe-eval'") && development.includes(' ws: wss:'));
  for (const value of ['', 'caller-nonce', `${nonce}' 'unsafe-inline`, `${nonce}\r\nInjected: value`]) {
    assert.throws(() => webContentSecurityPolicy(value, false), /Invalid document nonce/);
  }
});
