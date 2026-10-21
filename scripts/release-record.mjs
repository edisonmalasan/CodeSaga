import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const manifestPaths = ['package.json', 'apps/web/package.json', 'apps/api/package.json',
  'packages/contracts/package.json', 'packages/content/package.json'];
export const materialPaths = [...manifestPaths, 'pnpm-lock.yaml', '.nvmrc', '.github/workflows/verify.yml',
  'infra/compose.yaml', 'infra/minio/Dockerfile', 'apps/api/src/database/seed.ts',
  'packages/content/src/catalog.json', 'apps/web/ASSETS.md', 'apps/web/public/media/Silkscreen-OFL.txt',
  'apps/web/public/media/camp-observatory.png', 'docs/ROADMAP.md', 'docs/RELEASE.md',
  'docs/ARCHITECTURE.md', 'apps/api/PROVIDER_SETUP.md', 'infra/RECOVERY.md', 'apps/api/TELEMETRY.md',
  'scripts/release-record.mjs', 'docs/SECURITY.md', 'apps/web/proxy.ts', 'apps/web/next.config.ts',
  'apps/web/src/security-policy.ts', 'apps/api/src/security-headers.ts'];

export function createReleaseRecord(root) {
  const git = (...args) => {
    try { return execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 8 * 1024 * 1024, timeout: 10000 }); }
    catch { throw new Error('Cannot read required committed release inventory.'); }
  };
  // Ignored environment/research/build files are neither read nor inventoried.
  if (git('status', '--porcelain', '--untracked-files=normal').length) {
    throw new Error('Release inventory requires a clean checkout, including non-ignored untracked files.');
  }
  const commit = git('rev-parse', 'HEAD').toString().trim();
  const tree = git('rev-parse', 'HEAD^{tree}').toString().trim();
  if (![commit, tree].every((value) => /^[a-f0-9]{40,64}$/.test(value))) {
    throw new Error('Invalid Git source identity.');
  }
  const blob = (path) => git('show', `${commit}:${path}`);
  const readJson = (path) => JSON.parse(blob(path).toString());
  const rootPackage = readJson('package.json');
  if (!/^pnpm@\d+\.\d+\.\d+$/.test(rootPackage.packageManager)) {
    throw new Error('Release inventory requires an exact pnpm pin.');
  }
  const packages = manifestPaths.map((path) => {
    const manifest = readJson(path);
    const dependencies = {};
    for (const kind of ['dependencies', 'devDependencies']) {
      dependencies[kind] = Object.fromEntries(Object.entries(manifest[kind] ?? {}).sort(([a], [b]) => a.localeCompare(b)));
      for (const version of Object.values(dependencies[kind])) {
        if (typeof version !== 'string' || !/^(workspace:\*|\d+\.\d+\.\d+(?:-[\w.-]+)?)$/.test(version)) {
          throw new Error('Release inventory requires pinned or local workspace dependencies.');
        }
      }
    }
    return { path, name: manifest.name, version: manifest.version, ...dependencies };
  });
  const migrationPaths = git('ls-tree', '-r', '--name-only', commit, '--', 'apps/api/migrations')
    .toString().trim().split('\n').filter(Boolean);
  if (!migrationPaths.length || !migrationPaths.every((path) => /^apps\/api\/migrations\/\d{4}_[a-z0-9_]+\.sql$/.test(path))) {
    throw new Error('Release inventory requires recognized committed migrations.');
  }
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const materials = [...materialPaths, ...migrationPaths].sort().map((path) => {
    const bytes = blob(path);
    return { path, sha256: digest(bytes), bytes: bytes.length };
  });
  return {
    schemaVersion: 1, purpose: 'source_inventory', source: { commit, tree },
    runtime: { node: process.version, ciNodeMajor: blob('.nvmrc').toString().trim() },
    packageManager: rootPackage.packageManager, packages, materials,
    migrations: migrationPaths.map((path) => ({ path,
      checksum: digest(blob(path).toString().replace(/\r\n/g, '\n')) })),
    verification: { assertedByGenerator: false, workflow: '.github/workflows/verify.yml',
      instructions: 'docs/RELEASE.md' },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('Release inventory accepts no arguments.');
    console.log(JSON.stringify(createReleaseRecord(fileURLToPath(new URL('../', import.meta.url))), null, 2));
  } catch {
    console.error('Release inventory failed: use a clean committed checkout with required pinned materials.');
    process.exitCode = 1;
  }
}
