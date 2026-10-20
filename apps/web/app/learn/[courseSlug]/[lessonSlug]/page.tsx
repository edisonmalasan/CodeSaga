import { ShareLink } from '../../../../src/components/share-link';
import Link from 'next/link';
import { getCatalog, getLesson } from '../../../../src/catalog-client';
import { Breadcrumbs, ChapterTrail, PreviewNotice, Contents, LessonPager } from '../../../../src/components/content-ui';
import { RichContent } from '../../../../src/components/rich-content';
import { pageMetadata } from '../../../../src/metadata';
type Props = { params: Promise<{ courseSlug: string; lessonSlug: string }> };
export async function generateMetadata({ params }: Props) { const p = await params; const result = await getLesson(p.courseSlug, p.lessonSlug); return pageMetadata(`${result.record.title} · Reading preview`, result.record.summary, result.canonicalPath); }
export default async function LessonPage({ params }: Props) {
  const p = await params;
  const [result, catalog] = await Promise.all([getLesson(p.courseSlug, p.lessonSlug), getCatalog()]);
  const lesson = result.record;
  const course = catalog.courses.find((item) => item.id === lesson.courseId)!;
  const chapter = catalog.chapters.find((item) => item.id === lesson.chapterId)!;
  const trail = <ChapterTrail course={course} catalog={catalog} current={lesson.id} />;
  return <div className="page-container reading-page"><Breadcrumbs items={[{ title: course.language, href: `/courses/${course.slug}` }, { title: chapter.title, href: `/courses/${course.slug}/chapters/${chapter.slug}` }, { title: lesson.title }]} /><div className="reading-layout"><aside className="reading-sidebar"><div className="desktop-chapter">{trail}</div><details className="mobile-chapter"><summary>{course.language} · Chapter navigation</summary>{trail}</details><nav className="course-switch" aria-labelledby="course-switch-title"><h2 id="course-switch-title">Explore another subject</h2><ul>{catalog.courses.filter((item) => item.id !== course.id).map((item) => <li key={item.id}><Link href={`/courses/${item.slug}`}>{item.language}{item.availability === 'upcoming' ? ' · Upcoming' : ''}</Link></li>)}</ul></nav></aside><article className="reading-article"><header><span className="availability preview">Reading preview</span><h1>{lesson.title}</h1><p className="article-summary">{lesson.summary}</p><ShareLink canonicalPath={result.canonicalPath} /></header><PreviewNotice /><Contents blocks={lesson.body} /><RichContent blocks={lesson.body} /><LessonPager lesson={lesson} course={course} catalog={catalog} /></article></div></div>;
}
