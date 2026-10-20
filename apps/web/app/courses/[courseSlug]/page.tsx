import { ShareLink } from '../../../src/components/share-link';
import Link from 'next/link';
import { getCatalog, getCourse } from '../../../src/catalog-client';
import { Breadcrumbs, PreviewNotice, ResourceList } from '../../../src/components/content-ui';
import { Icon } from '../../../src/components/icons';
import { categoryNames } from '../../../src/content-paths';
import { pageMetadata } from '../../../src/metadata';
type Props = { params: Promise<{ courseSlug: string }> };
export async function generateMetadata({ params }: Props) { const { courseSlug } = await params; const result = await getCourse(courseSlug); return pageMetadata(result.record.title, result.record.summary, result.canonicalPath); }
export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params;
  const [result, catalog] = await Promise.all([getCourse(courseSlug), getCatalog()]);
  const course = result.record;
  const chapters = catalog.chapters.filter((item) => course.chapterIds.includes(item.id)).sort((a, b) => a.order - b.order);
  const lessons = catalog.lessons.filter((item) => item.courseId === course.id && item.availability === 'preview');
  return <div className="page-container detail-page"><Breadcrumbs items={[{ title: course.language }]} /><header className="course-heading"><div><h1>{course.title}</h1><p>{course.summary}</p><div className="metadata-row"><span>{categoryNames[course.category]}</span><span>{course.difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}</span><span className={`availability ${course.availability}`}>{course.availability === 'preview' ? 'Reading preview' : 'Upcoming'}</span></div><ShareLink canonicalPath={result.canonicalPath} /></div>{lessons[0] && <Link className="button" href={`/learn/${course.slug}/${lessons[0].slug}`}>Open the first preview<Icon name="arrow" /></Link>}</header>
    {course.availability === 'preview' ? <PreviewNotice /> : <div className="upcoming-notice"><h2>This trail is still taking shape</h2><p>No lessons or runnable environment have been published for {course.language}. A release date has not been set.</p><Link className="quiet-link" href="/courses">Browse available previews<Icon name="arrow" /></Link></div>}
    <div className="course-overview"><section><h2>Before you begin</h2><ul>{course.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul><h3>A useful way to start</h3><ul>{course.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h2>Inside this preview</h2><p>{lessons.length ? `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'} · ${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'} to read` : 'There is no published lesson content yet.'}</p><p>Explanations and static examples are available only where labelled. Learning progress is not recorded.</p></section></div>
    {!!chapters.length && <section className="chapter-section"><h2>The chapter trail</h2>{chapters.map((chapter) => <div className="chapter-outline" key={chapter.id}><div><h3><Link href={`/courses/${course.slug}/chapters/${chapter.slug}`}>{chapter.title}</Link></h3><p>{chapter.summary}</p></div><ol>{catalog.lessons.filter((item) => chapter.lessonIds.includes(item.id)).sort((a, b) => a.order - b.order).map((lesson) => <li key={lesson.id}>{lesson.availability === 'preview' ? <Link href={`/learn/${course.slug}/${lesson.slug}`}><span>{lesson.title}<small>Reading preview</small></span><Icon name="arrow" /></Link> : <span>{lesson.title} · Upcoming</span>}</li>)}</ol></div>)}</section>}
    {!!course.resourceIds.length && <section className="resources-section"><h2>Notes for the journey</h2><ResourceList resources={catalog.resources.filter((item) => course.resourceIds.includes(item.id))} /></section>}
    <section className="future-scope"><h2>Beyond this preview</h2><p>Further chapters and bonus reading are not published. Practice packs, checkpoint and final projects, automatic checking and certificates are not available in this release.</p><Link href="/help">Understand the current preview scope</Link></section>
  </div>;
}
