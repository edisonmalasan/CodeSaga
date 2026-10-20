import { spawn } from 'node:child_process';

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Integration tests require DATABASE_URL or TEST_DATABASE_URL. Run pnpm setup:local first.');
let url;
try { url = new URL(databaseUrl); } catch { throw new Error('Integration database URL is invalid.'); }
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !['postgres:', 'postgresql:'].includes(url.protocol)) {
  throw new Error('Integration tests require a local disposable PostgreSQL database.');
}
const child = spawn(process.execPath, ['--import', 'tsx', '--test', 'test/database.test.ts'], {
  cwd: 'apps/api',
  stdio: 'inherit',
  env: { ...process.env, TEST_DATABASE_URL: databaseUrl },
});
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
