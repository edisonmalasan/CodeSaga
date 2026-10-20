import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { after, before, test } from 'node:test';
import { apiErrorSchema, healthSchema } from '@codesaga/contracts';
import { createApp } from '../src/app';
import { readConfig } from '../src/config';
import { createDatabase } from '../src/database/database';
import { ApiExceptionFilter, ZodValidationPipe } from '../src/http';
import { z } from 'zod';
import type { ArgumentsHost } from '@nestjs/common';

const config = readConfig({
  NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused@127.0.0.1:1/unused',
  CORS_ORIGINS: 'http://localhost:3000',
});
let unavailable = false;
let closed = false;
let checks = 0;
let app: Awaited<ReturnType<typeof createApp>>;
let origin: string;

before(async () => {
  app = await createApp(config, {
    async check() { checks++; if (unavailable) throw new Error('postgresql://secret:password@private/db'); },
    async close() { closed = true; },
  });
  await app.listen(0, '127.0.0.1');
  origin = await app.getUrl();
});
after(async () => { await app?.close(); assert.equal(closed, true); });

test('liveness and readiness use the shared schema and request IDs', async () => {
  const beforeChecks = checks;
  const live = await fetch(`${origin}/health`, { headers: { 'x-request-id': 'test.request-1' } });
  assert.equal(live.status, 200);
  assert.equal(live.headers.get('x-request-id'), 'test.request-1');
  assert.equal(live.headers.get('x-powered-by'), null);
  assert.deepEqual(healthSchema.parse(await live.json()), { status: 'ok', service: 'codesaga-api' });
  assert.equal(checks, beforeChecks);
  const ready = await fetch(`${origin}/ready`);
  assert.equal(ready.status, 200);
  healthSchema.parse(await ready.json());
  assert.equal(checks, beforeChecks + 1);
});

test('readiness returns sanitized 503 and liveness survives a database outage', async () => {
  unavailable = true;
  try {
    const ready = await fetch(`${origin}/ready`);
    assert.equal(ready.status, 503);
    const body = apiErrorSchema.parse(await ready.json());
    assert.equal(body.error.code, 'DATABASE_UNAVAILABLE');
    assert.equal(body.error.message, 'Database unavailable');
    assert.equal(body.error.requestId, ready.headers.get('x-request-id'));
    assert.equal((await fetch(`${origin}/health`)).status, 200);
  } finally { unavailable = false; }
});

test('unknown routes, invalid query and invalid request IDs are deterministic', async () => {
  for (const [path, status, code] of [
    ['/missing', 404, 'NOT_FOUND'], ['/health?extra=1', 400, 'INVALID_REQUEST'],
    ['/ready?extra=1', 400, 'INVALID_REQUEST'],
  ] as const) {
    const response = await fetch(`${origin}${path}`, { headers: { 'x-request-id': 'invalid request id' } });
    assert.equal(response.status, status);
    const result = apiErrorSchema.parse(await response.json());
    assert.equal(result.error.code, code);
    assert.match(result.error.requestId, /^[a-f0-9-]{36}$/);
    assert.equal(result.error.requestId, response.headers.get('x-request-id'));
  }
});

test('CORS only allows configured origins and exposes request IDs', async () => {
  const allowed = await fetch(`${origin}/health`, { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(allowed.headers.get('access-control-expose-headers'), 'X-Request-ID,X-Trace-ID');
  const denied = await fetch(`${origin}/health`, { headers: { Origin: 'http://localhost:3000.evil.example' } });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  assert.equal(apiErrorSchema.parse(await denied.json()).error.code, 'ORIGIN_NOT_ALLOWED');
  const preflight = await fetch(`${origin}/health`, { method: 'OPTIONS', headers: {
    Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'GET',
  } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:3000');
});

test('malformed and oversized JSON share the public error envelope', async () => {
  for (const [body, status, code] of [['{broken', 400, 'INVALID_REQUEST'],
    [JSON.stringify({ text: 'a'.repeat(70000) }), 413, 'PAYLOAD_TOO_LARGE']] as const) {
    const response = await fetch(`${origin}/missing`, { method: 'POST',
      headers: { 'content-type': 'application/json' }, body });
    assert.equal(response.status, status);
    assert.equal(apiErrorSchema.parse(await response.json()).error.code, code);
  }
});

test('unhandled exceptions never expose their original message', () => {
  let status: number | undefined;
  let payload: unknown;
  const response = {
    locals: { requestId: 'safe-id' }, setHeader() {},
    status(value: number) { status = value; return this; }, json(value: unknown) { payload = value; },
  };
  const host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
  new ApiExceptionFilter().catch(new Error('password=super-secret'), host);
  assert.equal(status, 500);
  assert.deepEqual(apiErrorSchema.parse(payload).error,
    { code: 'INTERNAL_ERROR', message: 'Internal server error', requestId: 'safe-id' });
});

test('Zod validation parses valid data and rejects invalid values', () => {
  const pipe = new ZodValidationPipe(z.strictObject({ limit: z.number().int().positive() }));
  assert.deepEqual(pipe.transform({ limit: 2 }), { limit: 2 });
  assert.throws(() => pipe.transform({ limit: -1 }), /Invalid request/);
});

test('real unavailable PostgreSQL yields bounded readiness failure', async () => {
  const realApp = await createApp(config, createDatabase(config));
  try {
    await realApp.listen(0, '127.0.0.1');
    const response = await fetch(`${await realApp.getUrl()}/ready`);
    assert.equal(response.status, 503);
    assert.equal(apiErrorSchema.parse(await response.json()).error.code, 'DATABASE_UNAVAILABLE');
  } finally { await realApp.close(); }
});
