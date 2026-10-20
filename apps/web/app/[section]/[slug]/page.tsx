import { ShareLink } from '../../../src/components/share-link';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCatalog, getResource } from '../../../src/catalog-client';
import { Contents, PreviewNotice } from '../../../src/components/content-ui';
import { RichContent } from '../../../src/components/rich-content';
import { resourceNames } from '../../../src/content-paths';
import { pageMetadata } from '../../../src/metadata';
type Props = { params: Promise<{ section: string; slug: string }> };
async function load(params: Props['params']) {
  const { section, slug } = await params;
  if (!['resources', 'tutorials', 'blog'].includes(section)) notFound();
  const result = await getResource(slug);
  if (result.canonicalPath !== `/${section}/${slug}`) permanentRedirect(result.canonicalPath);
  return result;
}
export async function generateMetadata({ params }: Props) { const result = await load(params); return pageMetadata(result.record.title, result.record.summary, result.canonicalPath); }
export default async function ReadingPage({ params }: Props) {
  const [result, catalog] = await Promise.all([load(params), getCatalog()]);
  const resource = result.record;
  return <div className="page-container resource-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><ol><li><Link href={resource.kind === 'tutorial' ? '/tutorials' : resource.kind === 'blog' ? '/blog' : '/resources'}>{resource.kind === 'tutorial' ? 'Tutorials' : resource.kind === 'blog' ? 'Learning notes' : 'Resources'}</Link></li><li><span aria-current="page">{resource.title}</span></li></ol></nav><article className="reading-article"><header><span className="availability preview">{resourceNames[resource.kind]}</span><h1>{resource.title}</h1><p className="article-summary">{resource.summary}</p><ShareLink canonicalPath={result.canonicalPath} /></header><PreviewNotice /><Contents blocks={resource.body} /><RichContent blocks={resource.body} /><footer className="article-footer"><h2>Keep exploring</h2>{catalog.courses.filter((course) => resource.courseIds.includes(course.id)).map((course) => <Link key={course.id} href={`/courses/${course.slug}`}>{course.language} course overview</Link>)}<Link href="/resources">All reading resources</Link></footer></article></div>;
}
