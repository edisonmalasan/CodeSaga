import { expect, test } from '@playwright/test';
import { parsePreferences, preferenceKey } from '../apps/web/src/preferences-model';

for (const theme of ['light', 'dark'] as const) {
  test(`saved ${theme} appearance and reduced motion apply before hydration`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme === 'dark' ? 'light' : 'dark', reducedMotion: 'no-preference' });
    await page.addInitScript(({ key, theme }) => {
      localStorage.setItem(key, JSON.stringify({ theme, motion: 'reduced', sound: true }));
      const observed = window as typeof window & { preferenceAtBody?: string[]; previousThemes?: (string | null)[]; audioStarts?: number };
      observed.previousThemes = [];
      observed.audioStarts = 0;
      Object.defineProperty(window, 'AudioContext', { configurable: true, value: class {
        constructor() { observed.audioStarts!++; }
      } });
      const watcher = new MutationObserver((records) => {
        for (const record of records) {
          if (record.attributeName === 'data-theme') observed.previousThemes!.push(record.oldValue);
        }
        if (document.body && !observed.preferenceAtBody) observed.preferenceAtBody = [document.documentElement.dataset.theme!, document.documentElement.dataset.motion!];
      });
      watcher.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-theme'] });
    }, { key: preferenceKey, theme });

    let releaseHydration!: () => void;
    const hydration = new Promise<void>((resolve) => { releaseHydration = resolve; });
    await page.route('**/_next/static/**/*.js', async (route) => { await hydration; await route.continue(); });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto('/courses', { waitUntil: 'commit' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => (window as typeof window & { preferenceAtBody?: string[] }).preferenceAtBody)).toEqual([theme, 'reduced']);
      await expect(page.locator('body')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(17, 39, 46)' : 'rgb(241, 246, 248)');
      await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
      expect(await page.evaluate(() => (window as typeof window & { audioStarts?: number }).audioStarts)).toBe(0);
    } finally { releaseHydration(); }

    // Hydration restores the controls, without briefly writing the default theme.
    await page.locator('.preferences summary').click();
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue(theme);
    await expect(page.getByLabel('Motion', { exact: true })).toHaveValue('reduced');
    await expect(page.getByLabel('Quiet navigation sounds', { exact: true })).toBeChecked();
    await page.screenshot({ path: testInfo.outputPath('restored-preferences.png') });
    expect(await page.evaluate(() => (window as typeof window & { previousThemes?: (string | null)[] }).previousThemes?.filter((value) => value !== null && value !== document.documentElement.dataset.theme))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('local preference changes synchronize across tabs while unrelated storage is ignored', async ({ page, context }) => {
  const other = await context.newPage();
  await page.goto('/courses');
  await other.goto('/about');
  await page.locator('.preferences summary').click();
  await other.locator('.preferences summary').click();
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page.getByLabel('Motion', { exact: true }).selectOption('reduced');
  await page.getByLabel('Quiet navigation sounds', { exact: true }).check();
  await expect(other.getByLabel('Appearance', { exact: true })).toHaveValue('dark');
  await expect(other.getByLabel('Motion', { exact: true })).toHaveValue('reduced');
  await expect(other.getByLabel('Quiet navigation sounds', { exact: true })).toBeChecked();
  await other.evaluate((key) => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify({ theme: 'light' }), storageArea: sessionStorage }));
  }, preferenceKey);
  await expect(other.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.evaluate(() => localStorage.setItem('unrelated', '{"theme":"light"}'));
  await expect(other.getByLabel('Appearance', { exact: true })).toHaveValue('dark');
  await page.evaluate((key) => localStorage.removeItem(key), preferenceKey);
  await expect(other.getByLabel('Appearance', { exact: true })).toHaveValue('system');
  await expect(other.getByLabel('Motion', { exact: true })).toHaveValue('system');
  await expect(other.getByLabel('Quiet navigation sounds', { exact: true })).not.toBeChecked();
  await page.getByLabel('Appearance', { exact: true }).selectOption('light');
  await expect(other.getByLabel('Appearance', { exact: true })).toHaveValue('light');
  await page.evaluate(() => localStorage.clear());
  await expect(other.getByLabel('Appearance', { exact: true })).toHaveValue('system');
});

test('malformed and unknown stored preferences retain safe defaults without rewriting storage', async ({ page }) => {
  await page.goto('/about');
  for (const raw of ['{bad', 'null', '[]', '{"theme":"url(evil)","motion":"wild","sound":"yes"}', '{"theme":"light","motion":"reduced","sound":true}']) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: preferenceKey, raw });
    await page.reload();
    const expected = parsePreferences(raw);
    await expect(page.locator('html')).toHaveAttribute('data-theme', expected.theme);
    await expect(page.locator('html')).toHaveAttribute('data-motion', expected.motion);
    await page.locator('.preferences summary').click();
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue(expected.theme);
    await expect(page.getByLabel('Motion', { exact: true })).toHaveValue(expected.motion);
    await expect(page.getByLabel('Quiet navigation sounds', { exact: true })).toBeChecked({ checked: expected.sound });
    expect(await page.evaluate((key) => localStorage.getItem(key), preferenceKey)).toBe(raw);
  }
});
