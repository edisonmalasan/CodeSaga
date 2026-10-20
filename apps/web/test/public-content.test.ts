import assert from 'node:assert/strict';
import test from 'node:test';
import { safeImagePath, safeVideoUrl } from '../src/media-policy';
import { parsePreferences, defaultPreferences } from '../src/preferences-model';
import { filterCourses, validCategory } from '../src/catalog-model';
import type { Course } from '@codesaga/contracts';
import { richBlockSchema } from '@codesaga/contracts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichContent } from '../src/components/rich-content';
import { isPublicSection } from '../src/public-sections';

test('only explicit public sections can reach utility and reading index lookups', () => {
  for (const section of ['about', 'help', 'pricing', 'resources', 'tutorials', 'blog', 'search']) assert.equal(isPublicSection(section), true);
  for (const section of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'unknown', 'About', '']) assert.equal(isPublicSection(section), false);
});

test('media permits owned raster paths and specific safe video embed forms only', () => {
  assert.ok(safeImagePath('/media/camp-observatory.png'));
  for (const src of ['https://evil.test/a.png', '//evil.test/a.png', '/media/../secret.png', '/media/a.svg', '/media/a.png?x=1', '/media/a\\b.png']) assert.equal(safeImagePath(src), false);
  assert.ok(safeVideoUrl('https://www.youtube-nocookie.com/embed/abcdefghijk'));
  assert.ok(safeVideoUrl('https://player.vimeo.com/video/123456'));
  for (const src of ['javascript:alert(1)', 'https://evil.test/video/123456', 'https://player.vimeo.com/video/123?autoplay=1', 'https://www.youtube-nocookie.com.evil.test/embed/abcdefghijk']) assert.equal(safeVideoUrl(src), false);
});
test('stored preferences are bounded to known safe values and malformed storage resets', () => {
  assert.deepEqual(parsePreferences('{bad'), defaultPreferences);
  assert.deepEqual(parsePreferences('null'), defaultPreferences);
  assert.deepEqual(parsePreferences('{"theme":"url(evil)","sound":"yes","motion":"wild"}'), defaultPreferences);
  assert.deepEqual(parsePreferences('{"theme":"dark","sound":true,"motion":"reduced"}'), { theme: 'dark', sound: true, motion: 'reduced' });
});
test('course filtering composes words and categories and clearing restores every record', () => {
  const courses = [{ title: 'Python camp', summary: 'A first program', language: 'Python', tags: ['strings'], category: 'programming' }, { title: 'HTML & CSS', summary: 'A first page', language: 'HTML', tags: ['web'], category: 'web' }] as Course[];
  assert.equal(filterCourses(courses, ' PYTHON  strings ', 'programming').length, 1);
  assert.equal(filterCourses(courses, 'Python', 'web').length, 0);
  assert.equal(filterCourses(courses, 'no such course', '').length, 0);
  assert.equal(filterCourses(courses, '', '').length, 2);
  assert.equal(validCategory('arbitrary'), '');
});

test('rich prose and code stay escaped text and unsafe media cannot create active elements', () => {
  const html = renderToStaticMarkup(createElement(RichContent, { blocks: [
    { type: 'paragraph', text: '<script>alert(1)</script> and `a < b`' },
    { type: 'code', language: 'html', code: '<img src=x onerror=alert(1)>' },
    { type: 'image', src: 'https://unsafe.example/a.png', alt: 'Unavailable sample', caption: 'Fallback', width: 400, height: 200 },
    { type: 'video', src: 'javascript:alert(1)', title: 'Unavailable video', transcript: 'Read this instead.' },
  ] }));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img src=x'));
  assert.ok(html.includes('Image unavailable:'));
  assert.ok(html.includes('Read this instead.'));
  assert.ok(!html.includes('<script') && !html.includes('<img') && !html.includes('<iframe'));
  assert.equal(richBlockSchema.safeParse({ type: 'html', html: '<script>alert(1)</script>' }).success, false);
});
