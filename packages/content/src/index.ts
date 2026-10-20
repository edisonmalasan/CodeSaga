import {
  publishedCatalogSchema,
  courseSchema,
  chapterSchema,
  lessonSchema,
  resourceSchema,
  type ContentIdentity,
  type PublishedCatalog,
} from '@codesaga/contracts';
import authored from './catalog.json';

type Kind = 'course' | 'chapter' | 'lesson' | 'resource';
type Lookup<T> = { record: T; canonicalPath: string; isAlias: boolean } | null;

/** Validate both transport shape and authored relationships before serving content. */
export function createContentStore(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Content source must be an object');
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) throw new Error('Unsupported content source version');
  const parse = <T extends ContentIdentity>(value: unknown, schema: { parse(value: unknown): T }): T[] => {
    if (!Array.isArray(value)) throw new Error('Content collections must be arrays');
    return value.map((item) => schema.parse(item));
  };
  const source = {
    courses: parse(raw.courses, courseSchema), chapters: parse(raw.chapters, chapterSchema),
    lessons: parse(raw.lessons, lessonSchema), resources: parse(raw.resources, resourceSchema),
  };
  const ids = new Set<string>();
  for (const collection of Object.values(source)) {
    for (const item of collection) {
      if (ids.has(item.id)) throw new Error(`Duplicate content ID: ${item.id}`);
      ids.add(item.id);
    }
  }
  const published = <T extends ContentIdentity>(items: T[]) => items.filter((item) => item.publication === 'published');
  const catalog = publishedCatalogSchema.parse({ version: 1, courses: published(source.courses), chapters: published(source.chapters), lessons: published(source.lessons), resources: published(source.resources) });
  const courses = new Map(catalog.courses.map((item) => [item.id, item]));
  const chapters = new Map(catalog.chapters.map((item) => [item.id, item]));
  const lessons = new Map(catalog.lessons.map((item) => [item.id, item]));
  const resources = new Map(catalog.resources.map((item) => [item.id, item]));
  const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const unique = (items: string[], label: string) => assert(new Set(items).size === items.length, `Duplicate ${label}`);
  const names = (items: ContentIdentity[], label: string) => {
    const seen = new Set<string>();
    for (const item of items) for (const slug of [item.slug, ...item.aliases]) {
      assert(!seen.has(slug), `Conflicting ${label} slug or alias: ${slug}`);
      seen.add(slug);
    }
  };
  names(catalog.courses, 'course'); names(catalog.resources, 'resource');
  for (const course of catalog.courses) {
    unique(course.chapterIds, 'chapter reference'); unique(course.resourceIds, 'resource reference');
    const ownedChapters = catalog.chapters.filter((item) => item.courseId === course.id);
    const ownedLessons = catalog.lessons.filter((item) => item.courseId === course.id);
    names(ownedChapters, 'chapter'); names(ownedLessons, 'lesson');
    unique(ownedChapters.map((item) => String(item.order)), 'chapter order');
    for (const id of course.chapterIds) assert(chapters.get(id)?.courseId === course.id, 'Course chapter relationship is invalid');
    for (const chapter of ownedChapters) assert(course.chapterIds.includes(chapter.id), 'Chapter missing from its course');
    for (const id of course.resourceIds) assert(resources.get(id)?.courseIds.includes(course.id), 'Course resource relationship is invalid');
    if (course.availability === 'upcoming') assert(ownedChapters.every((chapter) => chapter.availability === 'upcoming'), 'Upcoming course cannot publish preview chapters');
  }
  for (const chapter of catalog.chapters) {
    assert(courses.has(chapter.courseId), 'Chapter requires a published course'); unique(chapter.lessonIds, 'lesson reference');
    const owned = catalog.lessons.filter((item) => item.chapterId === chapter.id);
    unique(owned.map((item) => String(item.order)), 'lesson order');
    for (const id of chapter.lessonIds) assert(lessons.get(id)?.chapterId === chapter.id, 'Chapter lesson relationship is invalid');
    for (const item of owned) assert(chapter.lessonIds.includes(item.id) && item.courseId === chapter.courseId, 'Lesson parent relationship is invalid');
    if (chapter.availability === 'upcoming') assert(owned.every((lesson) => lesson.availability === 'upcoming'), 'Upcoming chapter cannot publish preview lessons');
  }
  for (const lesson of catalog.lessons) assert(chapters.get(lesson.chapterId)?.courseId === lesson.courseId, 'Lesson requires published parents');
  for (const resource of catalog.resources) {
    unique(resource.courseIds, 'course reference');
    for (const id of resource.courseIds) assert(courses.get(id)?.resourceIds.includes(resource.id), 'Resource course relationship is invalid');
  }
  const copy = <T>(value: T): T => structuredClone(value);
  const path = (kind: Kind, id: string): string | null => {
    if (kind === 'course') { const item = courses.get(id); return item ? `/courses/${item.slug}` : null; }
    if (kind === 'chapter') { const item = chapters.get(id); const course = item && courses.get(item.courseId); return item && course ? `/courses/${course.slug}/chapters/${item.slug}` : null; }
    if (kind === 'lesson') { const item = lessons.get(id); const course = item && courses.get(item.courseId); return item && course ? `/learn/${course.slug}/${item.slug}` : null; }
    const item = resources.get(id);
    return item ? `/${item.kind === 'blog' ? 'blog' : item.kind === 'tutorial' ? 'tutorials' : 'resources'}/${item.slug}` : null;
  };
  const find = <T extends ContentIdentity>(items: T[], slug: string) => items.find((item) => item.slug === slug || item.aliases.includes(slug));
  const lookup = <T extends ContentIdentity>(record: T | undefined, kind: Kind, requestedPath: string): Lookup<T> => {
    if (!record) return null;
    const canonicalPath = path(kind, record.id)!;
    return { record: copy(record), canonicalPath, isAlias: canonicalPath !== requestedPath };
  };
  return {
    getPublishedCatalog: (): PublishedCatalog => copy(catalog),
    getCanonicalPath: path,
    getCourse: (slug: string) => lookup(find(catalog.courses, slug), 'course', `/courses/${slug}`),
    getChapter: (courseSlug: string, slug: string) => {
      const course = find(catalog.courses, courseSlug);
      return lookup(find(catalog.chapters.filter((item) => item.courseId === course?.id), slug), 'chapter', `/courses/${courseSlug}/chapters/${slug}`);
    },
    getLesson: (courseSlug: string, slug: string) => {
      const course = find(catalog.courses, courseSlug);
      const lesson = find(catalog.lessons.filter((item) => item.courseId === course?.id && item.availability === 'preview'), slug);
      return lookup(lesson, 'lesson', `/learn/${courseSlug}/${slug}`);
    },
    getResource: (slug: string) => {
      const record = find(catalog.resources, slug);
      const prefix = record?.kind === 'blog' ? 'blog' : record?.kind === 'tutorial' ? 'tutorials' : 'resources';
      return lookup(record, 'resource', `/${prefix}/${slug}`);
    },
  };
}

const store = createContentStore(authored);
export const { getPublishedCatalog, getCanonicalPath, getCourse, getChapter, getLesson, getResource } = store;
