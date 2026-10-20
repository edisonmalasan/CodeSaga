import { z } from 'zod';

export const slugSchema = z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const contentRefSchema = z.strictObject({ id: z.uuid(), version: z.number().int().positive() });
export const categorySchema = z.enum(['programming', 'web', 'data', 'tools']);
export const availabilitySchema = z.enum(['preview', 'upcoming']);
const shortText = z.string().trim().min(1).max(300);
const paragraph = z.string().trim().min(1).max(6000);
const publicImagePath = z.string().regex(/^\/media\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|webp|jpe?g|avif)$/);
const publicVideoUrl = z.string().regex(/^https:\/\/(?:www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}|player\.vimeo\.com\/video\/[0-9]{1,12})$/);

export const richBlockSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('paragraph'), text: paragraph }),
  z.strictObject({ type: z.literal('heading'), level: z.union([z.literal(2), z.literal(3)]), text: shortText }),
  z.strictObject({ type: z.literal('list'), ordered: z.boolean(), items: z.array(paragraph).min(1).max(30) }),
  z.strictObject({ type: z.literal('code'), language: z.enum(['python', 'html', 'css', 'text']), code: z.string().min(1).max(12000), caption: shortText.optional() }),
  z.strictObject({ type: z.literal('callout'), tone: z.enum(['note', 'tip', 'warning']), title: shortText, text: paragraph }),
  z.strictObject({ type: z.literal('instructions'), title: shortText, steps: z.array(paragraph).min(1).max(30) }),
  z.strictObject({ type: z.literal('image'), src: publicImagePath, alt: shortText, caption: shortText, width: z.number().int().min(1).max(4096), height: z.number().int().min(1).max(4096) }),
  z.strictObject({ type: z.literal('video'), src: publicVideoUrl, title: shortText, transcript: paragraph }),
]);

export const contentIdentitySchema = z.strictObject({
  id: z.uuid(), version: z.number().int().positive(), slug: slugSchema,
  aliases: z.array(slugSchema).max(20), title: shortText, summary: paragraph,
  publication: z.enum(['published', 'draft']),
});

export const courseSchema = contentIdentitySchema.extend({
  category: categorySchema, language: shortText, difficulty: z.enum(['beginner', 'intermediate']),
  availability: availabilitySchema,
  prerequisites: z.array(shortText).max(20), recommendations: z.array(shortText).max(20),
  chapterIds: z.array(z.uuid()).max(100), resourceIds: z.array(z.uuid()).max(100), tags: z.array(shortText).max(20),
});

export const chapterSchema = contentIdentitySchema.extend({
  courseId: z.uuid(), order: z.number().int().nonnegative(), availability: availabilitySchema,
  lessonIds: z.array(z.uuid()).max(100),
});

export const lessonSchema = contentIdentitySchema.extend({
  courseId: z.uuid(), chapterId: z.uuid(), order: z.number().int().nonnegative(),
  availability: availabilitySchema, body: z.array(richBlockSchema).max(100),
}).superRefine((lesson, context) => {
  if (lesson.availability === 'preview' && lesson.body.length === 0) {
    context.addIssue({ code: 'custom', path: ['body'], message: 'Reading previews require content' });
  }
  if (lesson.availability === 'upcoming' && lesson.body.length !== 0) {
    context.addIssue({ code: 'custom', path: ['body'], message: 'Upcoming lessons expose metadata only' });
  }
});

export const resourceSchema = contentIdentitySchema.extend({
  kind: z.enum(['article', 'blog', 'tutorial', 'cheatsheet']), category: categorySchema,
  courseIds: z.array(z.uuid()).max(100), body: z.array(richBlockSchema).min(1).max(100),
});

export const publishedCatalogSchema = z.strictObject({
  version: z.literal(1), courses: z.array(courseSchema).max(100), chapters: z.array(chapterSchema).max(1000),
  lessons: z.array(lessonSchema).max(5000), resources: z.array(resourceSchema).max(1000),
}).superRefine((catalog, context) => {
  for (const group of ['courses', 'chapters', 'lessons', 'resources'] as const) {
    catalog[group].forEach((record, index) => {
      if (record.publication !== 'published') {
        context.addIssue({ code: 'custom', path: [group, index, 'publication'], message: 'Drafts are not public' });
      }
    });
  }
});

const canonicalPathSchema = z.string().max(400).regex(/^\/(?:courses|learn|blog|tutorials|resources)\/[a-z0-9-]+(?:\/(?:chapters\/)?[a-z0-9-]+)?$/);
export const courseLookupSchema = z.strictObject({ record: courseSchema.refine((value) => value.publication === 'published', 'Drafts are not public'), canonicalPath: canonicalPathSchema, isAlias: z.boolean() });
export const chapterLookupSchema = z.strictObject({ record: chapterSchema.refine((value) => value.publication === 'published', 'Drafts are not public'), canonicalPath: canonicalPathSchema, isAlias: z.boolean() });
export const lessonLookupSchema = z.strictObject({ record: lessonSchema.refine((value) => value.publication === 'published' && value.availability === 'preview', 'Only published reading previews expose lesson bodies'), canonicalPath: canonicalPathSchema, isAlias: z.boolean() });
export const resourceLookupSchema = z.strictObject({ record: resourceSchema.refine((value) => value.publication === 'published', 'Drafts are not public'), canonicalPath: canonicalPathSchema, isAlias: z.boolean() });

export type ContentRef = z.infer<typeof contentRefSchema>;
export type ContentIdentity = z.infer<typeof contentIdentitySchema>;
export type RichBlock = z.infer<typeof richBlockSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type PublishedCatalog = z.infer<typeof publishedCatalogSchema>;
export type Category = z.infer<typeof categorySchema>;
