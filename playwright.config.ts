import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  globalTimeout: 180_000,
  reporter: 'list',
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
