import Link from 'next/link';
import type { Course, Lesson, PublishedCatalog, Resource, RichBlock } from '@codesaga/contracts';
import { categoryNames, resourceNames, resourcePath } from '../content-paths';
import { Icon } from './icons';
import { headingId } from './rich-content';

export function Breadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol><li><Link href="/courses">Courses</Link></li>{items.map((item, index) => <li key={index}>{item.href ? <Link href={item.href}>{item.title}</Link> : <span aria-current="page">{item.title}</span>}</li>)}</ol></nav>;
}
export function PreviewNotice() {
  return <div className="preview-notice"><Icon name="book" /><p><strong>Reading preview.</strong> Code and output are static examples. Running, checking and saved progress are not available yet.</p><Link href="/help">How previews work</Link></div>;
}
export function ChapterTrail({ course, catalog, current }: { course: Course; catalog: PublishedCatalog; current?: string }) {
  const chapters = catalog.chapters.filter((item) => item.courseId === course.id).sort((a, b) => a.order - b.order);
  return <nav className="chapter-trail" aria-label={`${course.language} chapter navigation`}><Link className="trail-course" href={`/courses/${course.slug}`}>{course.language}<span>Course overview</span></Link>{chapters.map((chapter) => <section key={chapter.id}><h2><Link href={`/courses/${course.slug}/chapters/${chapter.slug}`}>{chapter.title}</Link></h2><ol>{catalog.lessons.filter((lesson) => lesson.chapterId === chapter.id).sort((a, b) => a.order - b.order).map((lesson, index) => <li key={lesson.id} className={current === lesson.id ? 'current' : ''}><span className="trail-position" aria-hidden="true">{index + 1}</span>{lesson.availability === 'preview' ? <Link href={`/learn/${course.slug}/${lesson.slug}`} aria-current={current === lesson.id ? 'page' : undefined}>{lesson.title}<span>{current === lesson.id ? 'You are reading' : 'Reading preview'}</span></Link> : <span>{lesson.title}<small>Upcoming</small></span>}</li>)}</ol></section>)}<p className="trail-note">Your position in the chapter is shown here. Reading progress is not recorded.</p></nav>;
}
export function Contents({ blocks }: { blocks: RichBlock[] }) {
  const headings = blocks.map((block, index) => ({ block, index })).filter((item) => item.block.type === 'heading');
  if (!headings.length) return null;
  return <nav className="contents" aria-label="On this page"><h2>On this page</h2><ol>{headings.map(({ block, index }) => block.type === 'heading' && <li key={index}><a href={`#${headingId(block.text, index)}`}>{block.text}</a></li>)}</ol></nav>;
}
export function LessonPager({ lesson, course, catalog }: { lesson: Lesson; course: Course; catalog: PublishedCatalog }) {
  const lessons = catalog.lessons.filter((item) => item.courseId === course.id && item.availability === 'preview').sort((a, b) => {
    const first = catalog.chapters.find((chapter) => chapter.id === a.chapterId)?.order ?? 0;
    const second = catalog.chapters.find((chapter) => chapter.id === b.chapterId)?.order ?? 0;
    return first - second || a.order - b.order;
  });
  const index = lessons.findIndex((item) => item.id === lesson.id);
  return <nav className="lesson-pager" aria-label="Previous and next lessons">{lessons[index - 1] ? <Link href={`/learn/${course.slug}/${lessons[index - 1]!.slug}`}><span>Previous preview</span>{lessons[index - 1]!.title}</Link> : <Link href={`/courses/${course.slug}`}><span>Back to</span>Course overview</Link>}{lessons[index + 1] ? <Link href={`/learn/${course.slug}/${lessons[index + 1]!.slug}`}><span>Next preview</span>{lessons[index + 1]!.title}<Icon name="arrow" /></Link> : <Link href={`/courses/${course.slug}`}><span>End of this preview</span>Explore course resources<Icon name="arrow" /></Link>}</nav>;
}
export function ResourceList({ resources, headingLevel = 3 }: { resources: Resource[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <div className="resource-list">{resources.map((resource) => <article key={resource.id}><div><p className="resource-kind">{resourceNames[resource.kind]} <span aria-hidden="true">·</span> {categoryNames[resource.category]}</p><Heading className="resource-title"><Link href={resourcePath(resource)}>{resource.title}</Link></Heading><p>{resource.summary}</p></div><Link className="resource-open" href={resourcePath(resource)} aria-label={`Read ${resource.title}`}><Icon name="arrow" /></Link></article>)}</div>;
}
