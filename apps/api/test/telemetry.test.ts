import { strict as assert } from 'node:assert';
import { get } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app';
import { readConfig } from '../src/config';
import type { RequestTelemetry } from '../src/telemetry';

const config = readConfig({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused@127.0.0.1:1/unused',
  CORS_ORIGINS: 'http://localhost:3000' });
const secret = 'private-canary-73921';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

test('real HTTP outcomes have bounded fields and omit private request/response/error data', async () => {
  const records: RequestTelemetry[] = [];
  const app = await createApp(config, {
    async check() { throw new Error(`postgresql://${secret}:password@private/db`); }, async close() {},
  }, (event) => records.push(event));
  try {
    await app.listen(0, '127.0.0.1');
    const origin = await app.getUrl();
    const cases: [string, RequestInit, number, string][] = [
      ['/health', {}, 200, '/health'],
      ['/health', { method: 'HEAD' }, 200, '/health'],
      [`/api/v1/content/courses/${secret}`, {}, 404, '/api/v1/content/courses/:course'],
      [`/api/v1/content/courses/${secret}/chapters/${secret}`, {}, 404,
        '/api/v1/content/courses/:course/chapters/:chapter'],
      [`/api/v1/content/courses/${secret}/lessons/${secret}`, {}, 404,
        '/api/v1/content/courses/:course/lessons/:lesson'],
      [`/api/v1/content/resources/${secret}`, {}, 404, '/api/v1/content/resources/:resource'],
      [`/${secret}?token=${secret}`, {}, 404, 'unresolved'],
      [`/health?token=${secret}`, {}, 400, '/health'],
      ['/ready', {}, 503, '/ready'],
      ['/api/v1/session', {}, 503, '/api/v1/session'],
      ['/health', { headers: { origin: `https://${secret}.invalid` } }, 403, 'unresolved'],
      [`/${secret}`, { method: 'OPTIONS', headers: { origin: 'http://localhost:3000',
        'access-control-request-method': 'GET' } }, 204, 'unresolved'],
      ['/api/v1/executions', { method: 'POST', body: `{ "source": "${secret}"`,
        headers: { 'content-type': 'application/json' } }, 400, 'unresolved'],
      ['/api/v1/executions', { method: 'POST', body: JSON.stringify({ source: secret.repeat(6000) }),
        headers: { 'content-type': 'application/json' } }, 413, 'unresolved'],
      ['/api/v1/executions', { method: 'POST', body: JSON.stringify({ runtime: 'python',
        entry: 'main.py', content: { id: 'b1000000-0000-4000-8000-000000000001', version: 1 },
        files: [{ path: 'main.py', source: `print('${secret}')` }] }),
        headers: { 'content-type': 'application/json' } }, 503, '/api/v1/executions'],
    ];
    const traceIds = new Set<string>();
    for (const [path, init, status, route] of cases) {
      const response = await fetch(`${origin}${path}`, { ...init, headers: {
        authorization: `Bearer ${secret}`, cookie: `session=${secret}`, 'x-request-id': secret,
        'x-trace-id': secret, 'user-agent': secret, referer: `https://${secret}.invalid`, ...init.headers,
      } });
      await response.text();
      assert.equal(response.status, status);
      assert.equal(response.headers.get('x-request-id'), secret); // Compatibility, never logged.
      const traceId = response.headers.get('x-trace-id')!;
      assert.match(traceId, uuid);
      assert(!traceIds.has(traceId));
      traceIds.add(traceId);
      const event = records.at(-1)!;
      assert.equal(records.length, traceIds.size); // Finish + close must produce only one event.
      assert.equal(event.traceId, traceId);
      assert.equal(event.route, route);
      assert.equal(event.method, init.method ?? 'GET');
      assert.equal(event.statusCode, status);
      assert.equal(event.outcome, 'finished');
      assert.equal(event.schemaVersion, 1);
      assert.equal(event.event, 'http_request');
      assert(Object.isFrozen(event));
      assert(Number.isFinite(event.durationMs) && event.durationMs >= 0);
      assert(!Number.isNaN(Date.parse(event.timestamp)));
      assert.deepEqual(Object.keys(event).sort(), ['durationMs', 'event', 'method', 'outcome',
        'route', 'schemaVersion', 'statusCode', 'timestamp', 'traceId'].sort());
    }
    assert(!JSON.stringify(records).includes(secret));
    const allowed = await fetch(`${origin}/health`, { headers: { origin: 'http://localhost:3000' } });
    assert.equal(allowed.headers.get('access-control-expose-headers'), 'X-Request-ID,X-Trace-ID');
    await allowed.text();
  } finally { await app.close(); }
});

test('a real connection abort records once with no fabricated success status', { timeout: 8000 }, async () => {
  let release!: () => void;
  let entered!: () => void;
  let observed!: (event: RequestTelemetry) => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  const checking = new Promise<void>((resolve) => { entered = resolve; });
  const aborted = new Promise<RequestTelemetry>((resolve) => { observed = resolve; });
  const records: RequestTelemetry[] = [];
  const app = await createApp(config, {
    async check() { entered(); await pending; }, async close() {},
  }, (event) => { records.push(event); observed(event); });
  try {
    await app.listen(0, '127.0.0.1');
    const request = get(`${await app.getUrl()}/ready`);
    request.on('error', () => {}); // Expected client-side socket destruction.
    await checking;
    request.destroy();
    const event = await aborted;
    assert.equal(event.outcome, 'aborted');
    assert.equal(event.statusCode, null);
    assert.equal(event.route, '/ready');
    assert.match(event.traceId, uuid);
    release();
    await app.close();
    assert.equal(records.length, 1);
  } finally { release(); await app.close(); }
});

test('a failing telemetry sink leaves responses and public errors working', async () => {
  let writes = 0;
  const app = await createApp(config, { async check() {}, async close() {} }, () => {
    writes++; throw new Error(`collector ${secret}`);
  });
  try {
    await app.listen(0, '127.0.0.1');
    for (const [path, status] of [['/health', 200], ['/missing', 404]] as const) {
      const response = await fetch(`${await app.getUrl()}${path}`);
      assert.equal(response.status, status);
      assert(!(await response.text()).includes(secret));
    }
    assert.equal(writes, 2);
  } finally { await app.close(); }
});
