import type { Course, Category } from '@codesaga/contracts';
export function filterCourses(courses: Course[], query: string, category: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return courses.filter((course) => (!category || course.category === category) && words.every((word) => [course.title, course.summary, course.language, ...course.tags].join(' ').toLocaleLowerCase().includes(word)));
}
export function validCategory(value: string): Category | '' {
  return ['programming', 'web', 'data', 'tools'].includes(value) ? value as Category : '';
}
