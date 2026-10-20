const publicSections = ['about', 'help', 'pricing', 'resources', 'tutorials', 'blog', 'search'] as const;

/** Bound object lookups to owned routes, including names inherited from Object.prototype. */
export function isPublicSection(value: string): value is typeof publicSections[number] {
  return publicSections.some((section) => section === value);
}
