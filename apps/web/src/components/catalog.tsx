'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Course, PublishedCatalog } from '@codesaga/contracts';
import { filterCourses, validCategory } from '../catalog-model';
import { categoryNames } from '../content-paths';
import { Icon } from './icons';

export function CourseCatalog({ catalog, initialQuery = '', initialCategory = '' }: { catalog: PublishedCatalog; initialQuery?: string; initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(validCategory(initialCategory));
  useEffect(() => {
    const restore = () => { const params = new URLSearchParams(location.search); setQuery(params.get('q') ?? ''); setCategory(validCategory(params.get('category') ?? '')); };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  function change(nextQuery: string, nextCategory: string) {
    setQuery(nextQuery); setCategory(validCategory(nextCategory));
    const url = new URL(location.href);
    nextQuery ? url.searchParams.set('q', nextQuery) : url.searchParams.delete('q');
    nextCategory ? url.searchParams.set('category', nextCategory) : url.searchParams.delete('category');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  const filtered = filterCourses(catalog.courses, query, category);
  return <section className="catalog-section" id="course-catalog" aria-labelledby="catalog-title">
    <div className="section-heading"><div><h2 id="catalog-title">Find your starting point</h2><p>Browse a subject. Take the next small step.</p></div><span className="catalog-scope">Reading previews &amp; upcoming subjects</span></div>
    <div className="catalog-controls"><label className="search-label"><span>Search courses</span><span className="search-field"><Icon name="search" /><input type="search" value={query} maxLength={120} placeholder="Try Python, websites, data…" onChange={(event) => change(event.target.value, category)} /></span></label><button className="text-button reset-button" onClick={() => change('', '')} disabled={!query && !category}>Reset filters</button></div>
    <fieldset className="category-filters"><legend className="sr-only">Filter courses by subject</legend>{[['', 'All subjects'], ...Object.entries(categoryNames)].map(([value, label]) => <button key={value} type="button" aria-pressed={category === value} onClick={() => change(query, value!)}>{label}</button>)}</fieldset>
    <p className="result-count" role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'course' : 'courses'}{category ? ` in ${categoryNames[category]}` : ''}{query.trim() ? ` matching “${query.trim()}”` : ''}</p>
    {filtered.length ? <div className="course-grid">{filtered.map((course) => <CourseCard key={course.id} course={course} catalog={catalog} />)}</div> : <div className="empty-state"><Icon name="search" size={30} /><h3>No trail matches those filters</h3><p>Try a broader word, choose another subject, or reset to see every course.</p><button className="button" onClick={() => change('', '')}>Show all courses<Icon name="arrow" /></button></div>}
  </section>;
}

function CourseCard({ course, catalog }: { course: Course; catalog: PublishedCatalog }) {
  const lessons = catalog.lessons.filter((lesson) => lesson.courseId === course.id && lesson.availability === 'preview');
  const [name, subtitle] = course.title.split(': ');
  return <article className={`course-card category-${course.category} ${course.availability}`}>
    <div className="course-card-top"><span className="language-mark" aria-hidden="true">{course.language === 'Python' ? 'Py' : course.language === 'HTML & CSS' ? '</>' : course.language === 'JavaScript' ? 'JS' : course.language === 'SQL' ? 'SQL' : 'git'}</span><span className={`availability ${course.availability}`}>{course.availability === 'preview' ? 'Reading preview' : 'Upcoming'}</span></div>
    <p className="course-category">{categoryNames[course.category]} <span aria-hidden="true">·</span> {course.difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}</p>
    <h3><Link href={`/courses/${course.slug}`}>{name}<span>{subtitle}</span></Link></h3><p className="course-summary">{course.summary}</p>
    <details className="course-guide"><summary>Prerequisites and recommendations<span className="sr-only"> for {course.language}</span></summary><h4>Before you begin</h4><ul>{course.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul><h4>A useful way to start</h4><ul>{course.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></details>
    <div className="course-card-bottom"><span>{lessons.length ? `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'} to read` : 'Lessons not published yet'}</span><Link href={`/courses/${course.slug}`} className="course-open" aria-label={`${course.availability === 'preview' ? 'Explore' : 'View upcoming'} ${course.language} course`}><Icon name="arrow" /></Link></div>
  </article>;
}
