import { Injectable } from '@nestjs/common';
import { getPublishedCatalog, getCourse, getChapter, getLesson, getResource } from '@codesaga/content';
import { publishedCatalogSchema, courseLookupSchema, chapterLookupSchema, lessonLookupSchema, resourceLookupSchema } from '@codesaga/contracts';
import { PublicError } from '../http';

function published<T extends { record: { publication: string; availability?: string } }>(lookup: T | null, body = false): T {
  if (!lookup || lookup.record.publication !== 'published' ||
    (body && lookup.record.availability === 'upcoming')) {
    throw new PublicError('CONTENT_NOT_FOUND', 'Content not found', 404);
  }
  return lookup;
}

/** Authored published projections only; the database seed is unrelated infrastructure data. */
@Injectable()
export class PublishedContent {
  catalog() { return publishedCatalogSchema.parse(getPublishedCatalog()); }
  course(slug: string) { return courseLookupSchema.parse(published(getCourse(slug))); }
  chapter(course: string, chapter: string) {
    return chapterLookupSchema.parse(published(getChapter(course, chapter)));
  }
  lesson(course: string, lesson: string) {
    return lessonLookupSchema.parse(published(getLesson(course, lesson), true));
  }
  resource(slug: string) { return resourceLookupSchema.parse(published(getResource(slug))); }
}
