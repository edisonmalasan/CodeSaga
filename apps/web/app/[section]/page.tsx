import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '../../src/catalog-client';
import { utilityPages } from '../../src/utility-content';
import { RichContent } from '../../src/components/rich-content';
import { ResourceDiscovery } from '../../src/components/resource-discovery';
import { ResourceList } from '../../src/components/content-ui';
import { filterCourses, validCategory } from '../../src/catalog-model';
import { Icon } from '../../src/components/icons';
import { pageMetadata } from '../../src/metadata';
import { isPublicSection } from '../../src/public-sections';

const indexes: Record<string, { title: string; summary: string }> = {
  resources: { title: 'Notes for the journey.', summary: 'Original cheat sheets and articles to keep the small ideas close.' },
  tutorials: { title: 'Take an idea a little further.', summary: 'Original step-by-step guides for experimenting in your own tools.' },
  blog: { title: 'From the learning desk.', summary: 'Notes on understanding code and finding a useful way to begin.' },
  search: { title: 'What are you curious about?', summary: 'Search the published course and reading collections.' },
};
type Props = { params: Promise<{ section: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  if (!isPublicSection(section)) notFound();
  const content = utilityPages[section] ?? indexes[section];
  if (!content) notFound();
  return { ...pageMetadata(content.title, content.summary, `/${section}`), ...(section === 'search' ? { robots: { index: false, follow: true } } : {}) };
}
export default async function PublicPage({ params, searchParams }: Props) {
  const { section } = await params;
  if (!isPublicSection(section)) notFound();
  const utility = utilityPages[section];
  if (utility) return <div className="page-container utility-page"><article className="reading-article"><header><h1>{utility.title}</h1><p className="article-summary">{utility.summary}</p></header><RichContent blocks={utility.body} /><div className="utility-actions"><Link className="button" href="/courses">Explore reading previews<Icon name="arrow" /></Link>{section !== 'help' && <Link className="quiet-link" href="/help">What is available now?</Link>}</div></article></div>;
  const intro = indexes[section];
  if (!intro) notFound();
  const catalog = await getCatalog();
  if (section === 'search') {
    const params = await searchParams;
    const query = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
    const category = validCategory(typeof params.category === 'string' ? params.category : '');
    const courses = filterCourses(catalog.courses, query, category);
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const resources = catalog.resources.filter((resource) => (!category || resource.category === category) && words.every((word) => `${resource.title} ${resource.summary}`.toLowerCase().includes(word)));
    return <div className="page-container search-page"><div className="page-intro"><h1>{intro.title}</h1><p>{intro.summary}</p></div><form action="/search" className="public-search"><label htmlFor="public-search">Search public content</label><div><input id="public-search" name="q" type="search" defaultValue={query} maxLength={120} placeholder="Try variables, a first page, or Python" /><button className="button" type="submit">Search<Icon name="search" /></button></div></form><p className="result-count" role="status">{courses.length + resources.length} results{query ? ` for “${query}”` : ' across published content'}</p>{!courses.length && !resources.length ? <div className="empty-state"><h2>No match this time</h2><p>Try a broader word or return to the full collection.</p><Link className="button" href="/search">Clear search</Link></div> : <><section><h2>Courses</h2>{courses.length ? <ul className="search-results">{courses.map((course) => <li key={course.id}><Link href={`/courses/${course.slug}`}>{course.title}<Icon name="arrow" /></Link><p>{course.summary}</p><span className={`availability ${course.availability}`}>{course.availability === 'preview' ? 'Reading preview' : 'Upcoming'}</span></li>)}</ul> : <p>No courses match. Reading resources may help below.</p>}</section><section className="resources-section"><h2>Reading resources</h2><ResourceList resources={resources} /></section></>}</div>;
  }
  const resources = catalog.resources.filter((item) => section === 'tutorials' ? item.kind === 'tutorial' : section === 'blog' ? item.kind === 'blog' : item.kind === 'article' || item.kind === 'cheatsheet');
  return <div className="page-container index-page"><div className="page-intro"><h1>{intro.title}</h1><p>{intro.summary}</p></div><nav className="collection-nav" aria-label="Reading collections"><Link href="/resources" aria-current={section === 'resources' ? 'page' : undefined}>Resources</Link><Link href="/tutorials" aria-current={section === 'tutorials' ? 'page' : undefined}>Tutorials</Link><Link href="/blog" aria-current={section === 'blog' ? 'page' : undefined}>Learning notes</Link></nav><ResourceDiscovery resources={resources} /></div>;
}
