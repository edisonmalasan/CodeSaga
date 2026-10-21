import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  retries: 0,
  globalTimeout: 240_000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000' },
  projects: [
    { name: 'http', testMatch: 'foundation.spec.ts' },
    { name: 'accessibility', testMatch: 'accessibility.spec.ts', use: { browserName: 'chromium' } },
    ...(['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
      name: browserName, testMatch: ['discovery.spec.ts', 'preferences.spec.ts', 'security.spec.ts'], use: { browserName },
    })),
  ],
  webServer: [
    {
      name: 'API',
      cwd: './apps/api',
      command: process.env.CI
        ? 'node --env-file-if-exists=.env dist/main.js'
        : 'node --import tsx --env-file-if-exists=.env src/main.ts',
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: false,
      timeout: 60_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 1_000 },
      stdout: 'pipe',
    },
    {
      name: 'Web',
      cwd: './apps/web',
      command: `node node_modules/next/dist/bin/next ${process.env.CI ? 'start' : 'dev'} --hostname 127.0.0.1 --port 3000`,
      url: 'http://127.0.0.1:3000/health',
      reuseExistingServer: false,
      timeout: 60_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 1_000 },
      stdout: 'pipe',
      env: { NEXT_TELEMETRY_DISABLED: '1' },
    },
  ],
});
