import 'server-only';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  publishedCatalogSchema, courseLookupSchema, chapterLookupSchema,
  lessonLookupSchema, resourceLookupSchema, slugSchema,
} from '@codesaga/contracts';
import { parseWebEnvironment } from './environment';

const environment = () => parseWebEnvironment(process.env);
export const webOrigin = () => environment().WEB_ORIGIN;

async function read<T>(path: string, schema: { parse(value: unknown): T }): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${environment().API_BASE_URL}/api/v1/content${path}`, {
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
  } catch { throw new Error('Published content is temporarily unavailable. Please retry.'); }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Published content is temporarily unavailable. Please retry.');
  try { return schema.parse(await response.json()); }
  catch { throw new Error('Published content could not be loaded safely. Please retry.'); }
}

export const getCatalog = cache(async () => {
  const catalog = await read('/catalog', publishedCatalogSchema);
  if (!catalog) throw new Error('The course catalog is temporarily unavailable.');
  return catalog;
});
const slug = (value: string) => { if (!slugSchema.safeParse(value).success) notFound(); return encodeURIComponent(value); };
function canonical<T extends { canonicalPath: string; isAlias: boolean; record: { publication: string } }>(result: T | null): T {
  if (!result || result.record.publication !== 'published') notFound();
  if (result.isAlias) permanentRedirect(result.canonicalPath);
  return result;
}
export const getCourse = cache(async (course: string) => canonical(await read(`/courses/${slug(course)}`, courseLookupSchema)));
export const getChapter = cache(async (course: string, chapter: string) => canonical(await read(`/courses/${slug(course)}/chapters/${slug(chapter)}`, chapterLookupSchema)));
export const getLesson = cache(async (course: string, lesson: string) => canonical(await read(`/courses/${slug(course)}/lessons/${slug(lesson)}`, lessonLookupSchema)));
export const getResource = cache(async (resource: string) => canonical(await read(`/resources/${slug(resource)}`, resourceLookupSchema)));
