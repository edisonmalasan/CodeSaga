import Link from 'next/link';
import { getCatalog } from '../src/catalog-client';
import { CourseCatalog } from '../src/components/catalog';
import { Icon } from '../src/components/icons';
import { ResourceList } from '../src/components/content-ui';
import { pageMetadata } from '../src/metadata';

export const generateMetadata = () => pageMetadata('A place to begin coding', 'Explore original coding reading previews and find your first Python or HTML & CSS lesson.', '/');
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [catalog, params] = await Promise.all([getCatalog(), searchParams]);
  const first = catalog.courses.find((course) => course.slug === 'python');
  const firstLesson = catalog.lessons.find((lesson) => lesson.courseId === first?.id && lesson.order === 1);
  return <div className="page-container">
    <section className="trailhead"><div className="trailhead-copy"><h1>Choose a place<br />to begin.</h1><p>A little curiosity can take you a long way. Explore original coding lessons, one small idea at a time.</p><div className="trailhead-actions"><a className="button" href="#course-catalog">Explore the courses<Icon name="arrow" /></a>{first && firstLesson && <Link className="quiet-link" href={`/learn/${first.slug}/${firstLesson.slug}`}>Read your first Python lesson</Link>}</div><p className="preview-caption">Reading previews are open. Interactive tools are still ahead.</p></div><figure className="trailhead-art"><img src="/media/camp-observatory.png" width={1536} height={1024} alt="An explorer studies beside a lantern at a woodland camp, with a path leading to an observatory." fetchPriority="high" /><figcaption>An original CodeSaga world, made for curious beginnings.</figcaption></figure></section>
    <CourseCatalog catalog={catalog} initialQuery={typeof params.q === 'string' ? params.q : ''} initialCategory={typeof params.category === 'string' ? params.category : ''} />
    <section className="path-section"><div><h2>A small path through the previews</h2><p>Start with Python for your first program, or HTML &amp; CSS for your first page. These links select a catalog subject, so you can see exactly what is available.</p></div><div className="path-links"><Link href="/courses?category=programming">Start with programming<Icon name="arrow" /></Link><Link href="/courses?category=web">Explore the web<Icon name="arrow" /></Link></div></section>
    <section className="resources-section"><div className="section-heading"><div><h2>Keep a few notes close</h2><p>Useful references for the ideas you are reading.</p></div><Link className="quiet-link" href="/resources">All resources<Icon name="arrow" /></Link></div><ResourceList resources={catalog.resources.filter((item) => item.kind === 'cheatsheet' || item.kind === 'article')} /></section>
  </div>;
}
