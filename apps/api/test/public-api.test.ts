import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { after, before, test } from 'node:test';
import {
  apiErrorSchema, integrationCapabilitiesSchema, publishedCatalogSchema,
  courseLookupSchema, chapterLookupSchema, lessonLookupSchema, resourceLookupSchema,
} from '@codesaga/contracts';
import { createApp } from '../src/app';
import { readConfig } from '../src/config';

let app: Awaited<ReturnType<typeof createApp>>;
let origin: string;
let databaseReads = 0;
before(async () => {
  app = await createApp(readConfig({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused@127.0.0.1:1/unused',
    CORS_ORIGINS: 'http://localhost:3000' }), {
    async check() { databaseReads++; throw new Error('Database must not provide public authored content'); },
    async close() {},
  });
  await app.listen(0, '127.0.0.1');
  origin = await app.getUrl();
});
after(async () => { await app?.close(); assert.equal(databaseReads, 0); });

const content = '/api/v1/content';
async function json(path: string) {
  const response = await fetch(`${origin}${path}`);
  assert.equal(response.status, 200, path);
  return response.json();
}
async function error(path: string, status: number, code: string, init?: RequestInit) {
  const response = await fetch(`${origin}${path}`, { ...init,
    headers: { 'x-request-id': 'public-api.boundary', ...init?.headers } });
  assert.equal(response.status, status, path);
  const body = apiErrorSchema.parse(await response.json());
  assert.equal(body.error.code, code);
  assert.equal(body.error.requestId, 'public-api.boundary');
  assert.equal(response.headers.get('x-request-id'), body.error.requestId);
  assert.equal(response.headers.get('set-cookie'), null);
  return body;
}

test('published catalog and every available authored lookup validate public shared contracts', async () => {
  const catalog = publishedCatalogSchema.parse(await json(`${content}/catalog`));
  assert(catalog.courses.length >= 2);
  assert(catalog.lessons.some((lesson) => lesson.availability === 'preview'));
  assert(catalog.resources.length > 0);
  assert(!catalog.courses.some((course) => course.id === 'a1000000-0000-4000-8000-000000000001'));
  for (const course of catalog.courses) {
    const lookup = courseLookupSchema.parse(await json(`${content}/courses/${course.slug}`));
    assert.deepEqual(lookup.record, course);
    assert.equal(lookup.isAlias, false);
    assert.equal(course.publication, 'published');
    if (course.availability === 'upcoming') {
      await error(`${content}/courses/${course.slug}/lessons/first-lesson`, 404, 'CONTENT_NOT_FOUND');
    }
    for (const alias of course.aliases) {
      const alternative = courseLookupSchema.parse(await json(`${content}/courses/${alias}`));
      assert.equal(alternative.record.id, course.id);
      assert.equal(alternative.canonicalPath, lookup.canonicalPath);
      assert.equal(alternative.isAlias, true);
    }
  }
  for (const chapter of catalog.chapters) {
    const course = catalog.courses.find((item) => item.id === chapter.courseId)!;
    const lookup = chapterLookupSchema.parse(await json(`${content}/courses/${course.slug}/chapters/${chapter.slug}`));
    assert.deepEqual(lookup.record, chapter);
  }
  for (const lesson of catalog.lessons) {
    const course = catalog.courses.find((item) => item.id === lesson.courseId)!;
    const path = `${content}/courses/${course.slug}/lessons/${lesson.slug}`;
    if (lesson.availability === 'upcoming') {
      assert.equal(lesson.body.length, 0);
      await error(path, 404, 'CONTENT_NOT_FOUND');
    } else {
      const lookup = lessonLookupSchema.parse(await json(path));
      assert.deepEqual(lookup.record, lesson);
      assert(lookup.record.body.length > 0);
    }
    const otherCourse = catalog.courses.find((item) => item.id !== lesson.courseId)!;
    await error(`${content}/courses/${otherCourse.slug}/lessons/${lesson.slug}`, 404, 'CONTENT_NOT_FOUND');
  }
  for (const resource of catalog.resources) {
    const lookup = resourceLookupSchema.parse(await json(`${content}/resources/${resource.slug}`));
    assert.deepEqual(lookup.record, resource);
    assert.equal(lookup.record.publication, 'published');
  }
});

test('invalid, unknown, draft-fixture and query identities cannot become invented content', async () => {
  for (const path of ['/courses/unknown-course', '/courses/python-first-steps',
    '/courses/unknown-course/chapters/missing', '/courses/unknown-course/lessons/missing', '/resources/missing']) {
    await error(`${content}${path}`, 404, 'CONTENT_NOT_FOUND');
  }
  for (const path of ['/catalog?extra=1', '/courses/Bad%20Slug', '/resources/UPPERCASE',
    '/courses/good/chapters/bad_slug', '/courses/good/lessons/bad_slug']) {
    await error(`${content}${path}`, 400, 'INVALID_REQUEST');
  }
});

test('unconfigured capabilities and session never infer identity from browser credentials', async () => {
  const capabilities = integrationCapabilitiesSchema.parse(await json('/api/v1/capabilities'));
  assert.deepEqual(capabilities, { identity: { available: false, status: 'not_configured' },
    execution: { available: false, status: 'not_configured', runtimes: [] } });
  const body = await error('/api/v1/session', 503, 'IDENTITY_NOT_CONFIGURED', {
    headers: { cookie: 'session=forged-secret', authorization: 'Bearer forged-secret' },
  });
  assert.equal(body.error.message, 'Identity service not configured');
  assert(!JSON.stringify(body).includes('forged-secret'));
  await error('/api/v1/capabilities?available=true', 400, 'INVALID_REQUEST');
  await error('/api/v1/session?account=admin', 400, 'INVALID_REQUEST');
  await error('/api/v1/session/exchange', 404, 'NOT_FOUND', { method: 'POST' });
});

test('valid source never runs and invalid execution commands fail shared validation', async () => {
  const command = { runtime: 'python', content: { id: 'b1000000-0000-4000-8000-000000000001', version: 1 },
    entry: 'main.py', files: [{ path: 'main.py', source: 'raise RuntimeError("source must never execute")' }] };
  const post = (body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const body = await error('/api/v1/executions', 503, 'EXECUTION_NOT_CONFIGURED', post(command));
  assert.equal(body.error.message, 'Execution service not configured');
  for (const invalid of [{}, { ...command, runtime: 'shell' }, { ...command, xp: 100 },
    { ...command, files: [{ path: '../main.py', source: '' }] },
    { ...command, files: [{ path: 'main.py', source: 'x'.repeat(32001) }] }]) {
    await error('/api/v1/executions', 400, 'INVALID_REQUEST', post(invalid));
  }
  await error('/api/v1/executions?execute=true', 400, 'INVALID_REQUEST', post(command));
});
