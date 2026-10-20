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
