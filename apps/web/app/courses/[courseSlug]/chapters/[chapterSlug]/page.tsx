import { ShareLink } from '../../../../../src/components/share-link';
import Link from 'next/link';
import { getCatalog, getChapter } from '../../../../../src/catalog-client';
import { Breadcrumbs, PreviewNotice } from '../../../../../src/components/content-ui';
import { pageMetadata } from '../../../../../src/metadata';
import { Icon } from '../../../../../src/components/icons';
type Props = { params: Promise<{ courseSlug: string; chapterSlug: string }> };
export async function generateMetadata({ params }: Props) { const p = await params; const result = await getChapter(p.courseSlug, p.chapterSlug); return pageMetadata(result.record.title, result.record.summary, result.canonicalPath); }
export default async function ChapterPage({ params }: Props) {
  const p = await params;
  const [result, catalog] = await Promise.all([getChapter(p.courseSlug, p.chapterSlug), getCatalog()]);
  const chapter = result.record;
  const course = catalog.courses.find((item) => item.id === chapter.courseId)!;
  return <div className="page-container detail-page"><Breadcrumbs items={[{ title: course.language, href: `/courses/${course.slug}` }, { title: chapter.title }]} /><div className="page-intro"><h1>{chapter.title}</h1><p>{chapter.summary}</p><ShareLink canonicalPath={result.canonicalPath} /></div><PreviewNotice /><section className="chapter-outline"><h2>Read in order</h2><ol>{catalog.lessons.filter((item) => item.chapterId === chapter.id).sort((a, b) => a.order - b.order).map((lesson) => <li key={lesson.id}>{lesson.availability === 'preview' ? <Link href={`/learn/${course.slug}/${lesson.slug}`}><span>{lesson.title}<small>{lesson.summary}</small></span><Icon name="arrow" /></Link> : <span>{lesson.title} · Upcoming</span>}</li>)}</ol></section><Link className="quiet-link" href={`/courses/${course.slug}`}>Back to {course.language} overview</Link></div>;
}
