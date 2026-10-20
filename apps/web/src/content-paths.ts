import type { Resource } from '@codesaga/contracts';

export const resourcePath = (resource: Pick<Resource, 'kind' | 'slug'>) => `/${resource.kind === 'blog' ? 'blog' : resource.kind === 'tutorial' ? 'tutorials' : 'resources'}/${resource.slug}`;
export const categoryNames = { programming: 'Programming', web: 'Web development', data: 'Data', tools: 'Developer tools' } as const;
export const resourceNames = { article: 'Article', blog: 'Learning note', tutorial: 'Tutorial', cheatsheet: 'Cheat sheet' } as const;
