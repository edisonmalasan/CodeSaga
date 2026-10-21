import { expect, test } from '@playwright/test';
import { apiErrorSchema, healthSchema } from '../packages/contracts/src';

test('separate web and API processes expose valid health contracts', async ({ request }) => {
  for (const [port, service] of [[3000, 'codesaga-web'], [4000, 'codesaga-api']] as const) {
    const response = await request.get(`http://127.0.0.1:${port}/health`);
    expect(response.status()).toBe(200);
    expect(healthSchema.parse(await response.json())).toEqual({ status: 'ok', service });
  }
});

test('database readiness and unknown API routes return explicit states', async ({ request }) => {
  const ready = await request.get('http://127.0.0.1:4000/ready');
  expect(ready.status()).toBe(200);
  const missing = await request.get('http://127.0.0.1:4000/not-a-real-resource');
  expect(missing.status()).toBe(404);
  const failure = apiErrorSchema.parse(await missing.json());
  expect(failure.error.requestId).toBe(missing.headers()['x-request-id']);
});

test('document nonces are fresh, caller independent and absent from static resource policies', async ({ request }) => {
  const nonces = new Set<string>();
  const callerNonce = 'A'.repeat(32);
  for (const path of ['/', '/courses', '/missing-security-page', '/robotsXtxt-extra']) {
    const response = await request.get(path, { headers: {
      'x-codesaga-nonce': callerNonce, 'x-nonce': callerNonce,
      'content-security-policy': "script-src 'unsafe-inline'",
    } });
    const missing = path.startsWith('/missing') || path.startsWith('/robotsX');
    // Next.js retains 200 if a notFound result arrives after streaming starts.
    // Verify the unavailable document/noindex as well as its security policy.
    expect(missing ? [200, 404] : [200]).toContain(response.status());
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers['cache-control']).toContain('no-store');
    const policy = headers['content-security-policy'] ?? '';
    const nonce = policy.match(/'nonce-([A-Za-z0-9+/]{32})'/)?.[1];
    expect(nonce).toBeTruthy();
    expect(nonce).not.toBe(callerNonce);
    expect(nonces.has(nonce!)).toBe(false);
    nonces.add(nonce!);
    const script = policy.split('; ').find((value) => value.startsWith('script-src '))!;
    expect(script).not.toContain("'unsafe-inline'");
    if (process.env.CI) expect(script).not.toContain("'unsafe-eval'");
    expect(headers['x-codesaga-nonce']).toBeUndefined();
    const html = await response.text();
    if (missing) {
      expect(html).toContain('This trail is not on the map.');
      expect(html).toMatch(/<meta name="robots" content="noindex"\s*\/>/);
    }
    expect(html).toContain(`nonce="${nonce}"`);
    expect(html).not.toContain(`nonce="${callerNonce}"`);
  }
  for (const path of ['/health', '/robots.txt', '/sitemap.xml', '/media/camp-observatory.png']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers()['content-security-policy']).not.toContain('nonce-');
  }
});
