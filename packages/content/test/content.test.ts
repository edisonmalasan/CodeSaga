import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedCatalogSchema } from '@codesaga/contracts';
import authored from '../src/catalog.json';
import { createContentStore, getPublishedCatalog, getCourse, getChapter, getLesson, getResource, getCanonicalPath } from '../src';

test('the original published collection validates and exposes only the authored preview scope', () => {
  const catalog = getPublishedCatalog();
  assert.ok(publishedCatalogSchema.safeParse(catalog).success);
  assert.equal(catalog.lessons.filter((item) => item.availability === 'preview').length, 4);
  assert.equal(catalog.lessons.filter((item) => item.courseId === getCourse('python')!.record.id).length, 3);
  assert.equal(catalog.courses.filter((item) => item.availability === 'upcoming').length, 3);
  assert.ok(catalog.resources.some((item) => item.kind === 'blog'));
});

test('published reading bodies contain prose rather than draft routing metadata', () => {
  const catalog = getPublishedCatalog();
  for (const item of [...catalog.lessons, ...catalog.resources]) {
    for (const block of item.body) {
      if (block.type === 'paragraph') assert.doesNotMatch(block.text, /^(?:Slug |Kind [a-z]+;|Summary:)/, item.slug);
    }
  }
});

test('canonical aliases preserve identity and enforce course parents', () => {
  const course = getCourse('python')!;
  assert.equal(getCourse('python-basics')!.record.id, course.record.id);
  assert.equal(getCourse('python-basics')!.isAlias, true);
  const lesson = getLesson('python-basics', 'hello-world')!;
  assert.equal(lesson.canonicalPath, '/learn/python/a-message-from-camp');
  assert.equal(getCanonicalPath('lesson', lesson.record.id), lesson.canonicalPath);
  assert.equal(getLesson('html-css', 'hello-world'), null);
  assert.equal(getChapter('html-css', 'first-light'), null);
  assert.equal(getResource('missing'), null);
  assert.equal(getCanonicalPath('course', '00000000-0000-4000-8000-000000000000'), null);
});

test('renaming titles and slugs keeps stable IDs while the old slug redirects', () => {
  const source = structuredClone(authored);
  const first = source.courses[0]!;
  const previous = first.slug;
  first.aliases.push(previous); first.slug = 'python-trail'; first.title = 'A renamed Python trail'; first.version = 2;
  const store = createContentStore(source);
  assert.equal(store.getCourse(previous)!.record.id, first.id);
  assert.equal(store.getCourse(previous)!.canonicalPath, '/courses/python-trail');
  assert.equal(store.getLesson(previous, 'hello-world')!.canonicalPath, '/learn/python-trail/a-message-from-camp');
});

test('drafts stay private and upcoming lesson bodies are not retrievable', () => {
  const source = structuredClone(authored);
  source.resources.push({ ...source.resources[0]!, id: '31dad147-960c-41d6-abcc-b5dc6c67da8e', slug: 'private-note', aliases: [], publication: 'draft', courseIds: [] });
  const chapter = source.chapters[0]!;
  const next = { ...source.lessons[0]!, id: '4e85495b-80c4-44ab-a390-72b2ba656d2e', slug: 'later-lesson', aliases: [], order: 4, availability: 'upcoming', body: [] };
  source.lessons.push(next); chapter.lessonIds.push(next.id);
  const store = createContentStore(source);
  assert.equal(store.getResource('private-note'), null);
  assert.equal(store.getLesson('python', 'later-lesson'), null);
  assert.ok(!JSON.stringify(store.getPublishedCatalog()).includes('private-note'));
  assert.equal(store.getPublishedCatalog().lessons.find((item) => item.id === next.id)!.body.length, 0);
});

test('duplicate identities, ambiguous aliases and broken references are rejected', () => {
  const duplicate = structuredClone(authored); duplicate.resources[0]!.id = duplicate.courses[0]!.id;
  assert.throws(() => createContentStore(duplicate), /Duplicate content ID/);
  const aliases = structuredClone(authored); aliases.courses[1]!.aliases.push('python');
  assert.throws(() => createContentStore(aliases), /Conflicting course/);
  const broken = structuredClone(authored); broken.chapters[0]!.lessonIds.push('4e85495b-80c4-44ab-a390-72b2ba656d2e');
  assert.throws(() => createContentStore(broken), /Chapter lesson relationship/);
});

test('callers cannot mutate the shared authored source through returned values', () => {
  const catalog = getPublishedCatalog(); catalog.courses[0]!.title = 'Changed';
  const course = getCourse('python')!; course.record.aliases.length = 0;
  assert.notEqual(getPublishedCatalog().courses[0]!.title, 'Changed');
  assert.ok(getCourse('python-basics'));
});
