import { expect, test, type APIRequestContext } from '@playwright/test';
import { publishedCatalogSchema } from '../packages/contracts/src';

async function catalog(request: APIRequestContext) {
  const response = await request.get('http://127.0.0.1:4000/api/v1/content/catalog');
  expect(response.status()).toBe(200);
  return publishedCatalogSchema.parse(await response.json());
}

test('a learner can compose/reset filters and read a real original lesson', async ({ page, request }) => {
  const data = await catalog(request);
  const course = data.courses.find((item) => item.language === 'Python' && item.availability === 'preview')!;
  const lesson = data.lessons.find((item) => item.courseId === course.id && item.availability === 'preview')!;
  await page.goto('/courses');
  await expect(page.locator('.course-card')).toHaveCount(data.courses.length);
  const courseCard = page.locator('.course-card').filter({ has: page.getByRole('link', { name: 'Explore Python course', exact: true }) });
  await courseCard.locator('summary').click();
  for (const item of [...course.prerequisites, ...course.recommendations]) await expect(courseCard.getByText(item, { exact: true })).toBeVisible();
  await courseCard.locator('summary').press('Enter');
  await expect(courseCard.locator('details')).not.toHaveAttribute('open', '');
  await page.getByRole('searchbox', { name: 'Search courses', exact: true }).fill('Python');
  await page.getByRole('button', { name: 'Web development', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No trail matches those filters' })).toBeVisible();
  await expect(page).toHaveURL(/category=web/);
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search courses', exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'All subjects', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.course-card')).toHaveCount(data.courses.length);
  await page.getByRole('link', { name: 'Explore Python course', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(course.title);
  await page.getByRole('link', { name: 'Open the first preview', exact: true }).click();
  await expect(page).toHaveURL(`/learn/${course.slug}/${lesson.slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(lesson.title);
  await expect(page.locator('.reading-article pre').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Run(?: code)?$/i })).toHaveCount(0);
});

test('mobile navigation and display preferences work across reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/courses');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close navigation', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
  await page.locator('summary').filter({ hasText: 'Display and sound preferences' }).click();
  await page.getByRole('combobox', { name: 'Appearance', exact: true }).selectOption('dark');
  await page.getByRole('combobox', { name: 'Motion', exact: true }).selectOption('reduced');
  await page.getByLabel('Quiet navigation sounds', { exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.locator('summary').filter({ hasText: 'Display and sound preferences' }).click();
  await expect(page.getByLabel('Quiet navigation sounds', { exact: true })).toBeChecked();
});

test('denied browser storage preserves usable session preferences and content', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
  });
  await page.goto('/courses');
  await page.locator('summary').filter({ hasText: 'Display and sound preferences' }).click();
  await page.getByRole('combobox', { name: 'Appearance', exact: true }).selectOption('dark');
  await expect(page.getByText('Browser storage is unavailable. Your choices work for this session.')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('searchbox', { name: 'Search courses', exact: true }).fill('Python');
  await expect(page.getByRole('link', { name: 'Explore Python course', exact: true })).toBeVisible();
});

test('aliases retain identity and wrong-parent/upcoming URLs never invent lessons', async ({ page, request }) => {
  const data = await catalog(request);
  const aliased = data.courses.find((item) => item.aliases.length)!;
  await page.goto(`/courses/${aliased.aliases[0]}`);
  await expect(page).toHaveURL(`/courses/${aliased.slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(aliased.title);
  const lesson = data.lessons.find((item) => item.availability === 'preview')!;
  const other = data.courses.find((item) => item.id !== lesson.courseId)!;
  await page.goto(`/learn/${other.slug}/${lesson.slug}`);
  await expect(page.getByRole('heading', { name: 'This trail is not on the map.' })).toBeVisible();
  await page.goto('/courses/Bad_Slug');
  await expect(page.getByRole('heading', { name: 'This trail is not on the map.' })).toBeVisible();
  const upcoming = data.courses.find((item) => item.availability === 'upcoming')!;
  await page.goto(`/courses/${upcoming.slug}`);
  await expect(page.getByRole('heading', { name: 'This trail is still taking shape' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the first preview' })).toHaveCount(0);
});

test('discovery and every reading preview fit narrow, tablet and desktop widths', async ({ page, request }) => {
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('main')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `horizontal overflow at ${width}px`).toBe(true);
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip/i })).toBeFocused();
  const data = await catalog(request);
  for (const lesson of data.lessons.filter((item) => item.availability === 'preview')) {
    const course = data.courses.find((item) => item.id === lesson.courseId)!;
    await page.goto(`/learn/${course.slug}/${lesson.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(lesson.title);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${lesson.slug} overflows at ${width}px`).toBe(true);
    }
  }
});

test('public metadata and sitemap use canonical published identities', async ({ page, request }) => {
  const data = await catalog(request);
  const course = data.courses.find((item) => item.availability === 'preview')!;
  await page.goto(`/courses/${course.slug}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `http://localhost:3000/courses/${course.slug}`);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`/courses/${course.slug}`);
  expect(xml).toContain('/learn/');
  expect(xml).not.toMatch(/\/(?:account|admin|assistant|re)\//);
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');
});

test('original media expands with keyboard recovery and has a broken-image fallback', async ({ page, request }) => {
  const data = await catalog(request);
  const resource = data.resources.find((item) => item.body.some((block) => block.type === 'image'))!;
  const image = resource.body.find((block) => block.type === 'image')!;
  const section = resource.kind === 'blog' ? 'blog' : resource.kind === 'tutorial' ? 'tutorials' : 'resources';
  await page.goto(`/${section}/${resource.slug}`);
  const trigger = page.getByRole('button', { name: `Expand image: ${image.alt}`, exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.route(`**${image.src}`, (route) => route.abort());
  await page.reload();
  // Reading media is lazy: bring its position into view to request the image.
  await page.locator('.content-image, .missing-media').scrollIntoViewIfNeeded();
  await expect(page.getByText(`Image unavailable: ${image.alt}`, { exact: true })).toBeVisible();
});

test('sharing copies canonical identity and offers a selectable URL when denied', async ({ page, request }) => {
  const data = await catalog(request);
  const course = data.courses.find((item) => item.aliases.length)!;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (value: string) => { (window as Window & { copied?: string }).copied = value; },
    } });
  });
  await page.goto(`/courses/${course.aliases[0]}`);
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(page.getByText('Link copied.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { copied?: string }).copied)).toBe(`http://127.0.0.1:3000/courses/${course.slug}`);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); },
    } });
  });
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(page.getByText('Clipboard is unavailable. Select and copy the link below.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Canonical page link', { exact: true })).toHaveValue(`http://127.0.0.1:3000/courses/${course.slug}`);
});

test('public reading collections and utility routes work while unknown sections remain unavailable', async ({ page }) => {
  for (const route of ['/resources', '/tutorials', '/blog', '/about', '/help', '/pricing']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'This trail is not on the map.' })).toHaveCount(0);
  }
  await page.goto('/search?q=zzznomatch');
  await expect(page.getByRole('heading', { name: 'No match this time' })).toBeVisible();
  await page.getByRole('link', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('.search-results li').first()).toBeVisible();
  for (const section of ['constructor', '__proto__', 'toString']) {
    await page.goto(`/${section}`);
    await expect(page.getByRole('heading', { name: 'This trail is not on the map.' })).toBeVisible();
  }
});
