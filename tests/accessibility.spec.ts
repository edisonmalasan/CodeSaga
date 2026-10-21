import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { getCanonicalPath, getPublishedCatalog } from '../packages/content/src';
import { preferenceKey } from '../apps/web/src/preferences-model';

const catalog = getPublishedCatalog();
const routes = [...new Set([
  '/', '/courses', '/resources', '/tutorials', '/blog', '/search', '/about', '/help', '/pricing',
  '/search?q=zzznomatch', '/courses?q=zzznomatch', '/not-a-real-page',
  ...catalog.courses.map((item) => getCanonicalPath('course', item.id)!),
  ...catalog.chapters.map((item) => getCanonicalPath('chapter', item.id)!),
  ...catalog.lessons.filter((item) => item.availability === 'preview').map((item) => getCanonicalPath('lesson', item.id)!),
  ...catalog.resources.map((item) => getCanonicalPath('resource', item.id)!),
])];

async function scan(page: Page, info: TestInfo, state: string) {
  await page.evaluate(() => document.fonts.ready);
  // Dataset mutation precedes the rendered theme. Assert the final foreground
  // before asking axe to compare inherited text with the themed background.
  const theme = await page.locator('html').getAttribute('data-theme');
  await expect(page.locator('body')).toHaveCSS('color', theme === 'dark' ? 'rgb(233, 243, 244)' : 'rgb(21, 52, 63)');
  // Streamed server fragments can coexist briefly with their hydrated replacement.
  // Require a complete, uniquely identified document; never remove hidden nodes or
  // exclude them from axe to manufacture a clean result.
  await expect.poll(() => page.locator('[id]').evaluateAll((elements) => {
    const seen = new Set<string>();
    return elements.filter((element) => {
      if (seen.has(element.id)) return true;
      seen.add(element.id); return false;
    }).map((element) => element.id);
  }), { message: 'Rendered document IDs must be unique before scanning' }).toEqual([]);
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const results = await new AxeBuilder({ page }).analyze();
  // Keep inconclusive checks visible; they must never be reported as passes.
  const summarize = (items: typeof results.violations) => items.map((item) => ({
    id: item.id, impact: item.impact, help: item.help, helpUrl: item.helpUrl,
    targets: item.nodes.map((node) => node.target),
  }));
  const output = info.outputPath(`axe-${state}.json`);
  await writeFile(output, JSON.stringify({
    route: new URL(page.url()).pathname, state,
    theme, engine: results.testEngine,
    violations: summarize(results.violations), incomplete: summarize(results.incomplete),
    passCount: results.passes.length, inapplicableCount: results.inapplicable.length,
  }, null, 2));
  await info.attach(`axe-${state}`, { contentType: 'application/json', path: output });
  expect(results.violations, `${state}: ${results.violations.map((item) => `${item.id}: ${item.help}`).join('; ')}`).toEqual([]);
  const reviewTargets = state === 'menu' ? ['h1', '.page-intro > p']
    : state === 'preferences' ? ['.preference-panel > p'] : [];
  const unexpected = results.incomplete.filter((item) => item.id !== 'color-contrast'
    || item.nodes.some((node) => node.target.length !== 1 || !reviewTargets.includes(String(node.target[0]))));
  expect(unexpected, 'New inconclusive checks need explicit review, even with zero violations').toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} public accessibility`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(({ key, theme }) => {
        localStorage.setItem(key, JSON.stringify({ theme, motion: 'reduced', sound: false }));
      }, { key: preferenceKey, theme });
    });
    for (const route of routes) {
      test(`automated rules: ${route}`, async ({ page }, info) => {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await scan(page, info, 'page');
      });
    }
    test('open preferences and mobile navigation', async ({ page }, info) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/courses');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('summary').filter({ hasText: 'Display and sound preferences' }).click();
      await expect(page.getByRole('combobox', { name: 'Appearance', exact: true })).toBeVisible();
      await scan(page, info, 'preferences');
      await page.getByRole('combobox', { name: 'Appearance', exact: true }).press('Escape');
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Close navigation', exact: true })).toHaveAttribute('aria-expanded', 'true');
      await scan(page, info, 'menu');
    });
    test('expanded image dialog', async ({ page }, info) => {
      const resource = catalog.resources.find((item) => item.body.some((block) => block.type === 'image'))!;
      await page.goto(getCanonicalPath('resource', resource.id)!);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.getByRole('button', { name: /^Expand image:/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await scan(page, info, 'image-dialog');
    });
  });
}

test('200% text resizing preserves discovery and reading access', async ({ page }) => {
  const lesson = catalog.lessons.find((item) => item.availability === 'preview')!;
  for (const route of ['/courses', getCanonicalPath('lesson', lesson.id)!]) {
    await page.goto(route);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  }
});

test('device reduced motion and forced colors retain usable navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/courses');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.keyboard.press('Escape');
  const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
  await expect(toggle).toBeFocused();
  expect(await toggle.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
});
