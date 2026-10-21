import { expect, test } from '@playwright/test';

test('the browser blocks injected scripts while authorized bootstrap and hydration still work', async ({ page, context, browserName }) => {
  // A replayed response lacks Chromium's ordinary loopback address attribution.
  // Permit only this test origin's development HMR connection; CSP stays enforced.
  if (!process.env.CI && browserName === 'chromium') {
    await context.grantPermissions(['local-network-access'], { origin: 'http://127.0.0.1:3000' });
  }
  const callerNonce = 'A'.repeat(32);
  await page.setExtraHTTPHeaders({ 'x-codesaga-nonce': callerNonce, 'content-security-policy': "script-src 'unsafe-inline'" });
  await page.addInitScript(() => {
    localStorage.setItem('codesaga.preferences.v1', JSON.stringify({ theme: 'dark', motion: 'reduced', sound: false }));
    const state = window as typeof window & { policyViolations?: string[] };
    state.policyViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => state.policyViolations!.push(event.effectiveDirective));
  });
  await page.route('**/courses', async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    const body = html.replace('</head>', `<script>window.untrustedScriptExecuted = true</script><script nonce="${callerNonce}">window.forgedNonceExecuted = true</script></head>`);
    expect(body).not.toBe(html);
    await route.fulfill({ response, body });
  });
  await page.goto('/courses');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.locator('.preferences summary').click();
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('dark');
  await expect.poll(() => page.evaluate(() => (window as typeof window & { policyViolations?: string[] }).policyViolations?.filter((value) => value.startsWith('script-src')).length)).toBe(2);
  expect(await page.evaluate(() => {
    const state = window as typeof window & { untrustedScriptExecuted?: boolean; forgedNonceExecuted?: boolean };
    return [state.untrustedScriptExecuted === true, state.forgedNonceExecuted === true];
  })).toEqual([false, false]);
  // A controlled input change proves React hydrated, rather than merely showing SSR.
  await page.getByLabel('Appearance', { exact: true }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.keyboard.press('Escape');
  await page.getByRole('searchbox', { name: 'Search courses', exact: true }).fill('Python');
  await expect(page.locator('.course-card')).toHaveCount(1);
});
