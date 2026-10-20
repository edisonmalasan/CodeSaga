import type { MetadataRoute } from 'next';
import { getCatalog, webOrigin } from '../src/catalog-client';
import { resourcePath } from '../src/content-paths';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const paths = ['/', '/courses', '/resources', '/tutorials', '/blog', '/about', '/help', '/pricing'];
  for (const course of catalog.courses) {
    paths.push(`/courses/${course.slug}`);
    for (const chapter of catalog.chapters.filter((item) => item.courseId === course.id && item.availability === 'preview')) paths.push(`/courses/${course.slug}/chapters/${chapter.slug}`);
    for (const lesson of catalog.lessons.filter((item) => item.courseId === course.id && item.availability === 'preview')) paths.push(`/learn/${course.slug}/${lesson.slug}`);
  }
  paths.push(...catalog.resources.map(resourcePath));
  return [...new Set(paths)].map((path) => ({ url: `${webOrigin()}${path}` }));
}
