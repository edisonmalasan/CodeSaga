import assert from 'node:assert/strict';
import { test } from 'node:test';
import { courseLookupSchema, publishedCatalogSchema, lessonSchema, lessonLookupSchema, richBlockSchema } from '../src';

const course = {
  id: 'b1000000-0000-4000-8000-000000000001', version: 1, slug: 'python-first-steps', aliases: ['python-start'],
  title: 'Python first steps', summary: 'Original public reading preview.', publication: 'published',
  category: 'programming', language: 'Python', difficulty: 'beginner', availability: 'preview',
  prerequisites: [], recommendations: [], chapterIds: [], resourceIds: [], tags: [],
};
const lesson = {
  id: 'b3000000-0000-4000-8000-000000000001', version: 1, slug: 'first-message', aliases: [],
  title: 'First message', summary: 'Read a first program.', publication: 'published',
  courseId: course.id, chapterId: 'b2000000-0000-4000-8000-000000000001', order: 0,
  availability: 'preview', body: [{ type: 'code', language: 'python', code: 'print("Hello")' }],
};

test('public schemas reject drafts, hidden fields and unsafe canonical destinations', () => {
  const catalog = { version: 1, courses: [course], chapters: [], lessons: [], resources: [] };
  assert.equal(publishedCatalogSchema.safeParse(catalog).success, true);
  assert.equal(publishedCatalogSchema.safeParse({ ...catalog, courses: [{ ...course, publication: 'draft' }] }).success, false);
  assert.equal(publishedCatalogSchema.safeParse({ ...catalog, courses: [{ ...course, privateValidator: 'secret' }] }).success, false);
  const lookup = { record: course, canonicalPath: '/courses/python-first-steps', isAlias: false };
  assert.equal(courseLookupSchema.safeParse(lookup).success, true);
  assert.equal(courseLookupSchema.safeParse({ ...lookup, record: { ...course, publication: 'draft' } }).success, false);
  for (const canonicalPath of ['//evil.example', 'https://evil.example', '/account/settings', '/courses/../account']) {
    assert.equal(courseLookupSchema.safeParse({ ...lookup, canonicalPath }).success, false);
  }
});

test('upcoming lessons expose metadata without an invented body or readable endpoint', () => {
  assert.equal(lessonSchema.safeParse(lesson).success, true);
  assert.equal(lessonSchema.safeParse({ ...lesson, body: [] }).success, false);
  const upcoming = { ...lesson, availability: 'upcoming', body: [] };
  assert.equal(lessonSchema.safeParse(upcoming).success, true);
  assert.equal(lessonSchema.safeParse({ ...upcoming, body: lesson.body }).success, false);
  assert.equal(lessonLookupSchema.safeParse({ record: upcoming, canonicalPath: '/learn/python-first-steps/first-message', isAlias: false }).success, false);
});

test('rich blocks allow text/code while rejecting arbitrary markup and media origins', () => {
  assert.equal(richBlockSchema.safeParse({ type: 'code', language: 'html', code: '<script>alert(1)</script>' }).success, true);
  assert.equal(richBlockSchema.safeParse({ type: 'html', html: '<script>alert(1)</script>' }).success, false);
  const image = { type: 'image', src: '/media/camp-observatory.png', alt: 'An original camp', caption: 'Original artwork', width: 1536, height: 1024 };
  assert.equal(richBlockSchema.safeParse(image).success, true);
  for (const src of ['//evil.example/a.png', 'https://evil.example/a.png', '/media/../secret.png', '/media/a.svg', '/media/a.png?x=1', '/media/a\\b.png']) {
    assert.equal(richBlockSchema.safeParse({ ...image, src }).success, false);
  }
  assert.equal(richBlockSchema.safeParse({ ...image, onerror: 'alert(1)' }).success, false);
  const video = { type: 'video', src: 'https://www.youtube-nocookie.com/embed/abcdefghijk', title: 'Example', transcript: 'A transcript.' };
  assert.equal(richBlockSchema.safeParse(video).success, true);
  for (const src of ['javascript:alert(1)', 'https://www.youtube-nocookie.com.evil.example/embed/abcdefghijk', 'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1']) {
    assert.equal(richBlockSchema.safeParse({ ...video, src }).success, false);
  }
});
