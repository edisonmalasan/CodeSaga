import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { createReleaseRecord, materialPaths } from './release-record.mjs';

test('inventory binds exact committed materials without reading ignored private files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'codesaga-inventory-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  const put = async (path, contents) => {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), contents);
  };
  try {
    git('init', '--quiet');
    for (const path of materialPaths) await put(path, await readFile(new URL(`../${path}`, import.meta.url)));
    await put('.gitignore', '.env\nre/\n.local/\n');
    const migration = 'apps/api/migrations/0001_original.sql';
    await put(migration, 'CREATE TABLE original (id integer PRIMARY KEY);\r\n');
    git('add', '.');
    git('-c', 'user.name=Inventory test', '-c', 'user.email=inventory@example.invalid',
      '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'test fixture');
    const secret = 'private-not-for-release-73921';
    await put('.env', `DATABASE_URL=${secret}`);
    await put('re/private.md', secret);
    await put('.local/private.json', secret);
    const record = createReleaseRecord(root);
    assert.equal(record.source.commit, git('rev-parse', 'HEAD'));
    assert.equal(record.source.tree, git('rev-parse', 'HEAD^{tree}'));
    assert.equal(record.verification.assertedByGenerator, false);
    assert.equal(record.materials.length, materialPaths.length + 1);
    assert(!JSON.stringify(record).includes(secret));
    assert(!record.materials.some(({ path }) => path.startsWith('re/') || path.startsWith('.local/') || path === '.env'));
    const source = git('show', `HEAD:${migration}`);
    const bytes = execFileSync('git', ['show', `HEAD:${migration}`], { cwd: root });
    const hash = (value) => createHash('sha256').update(value).digest('hex');
    assert.equal(record.materials.find(({ path }) => path === migration).sha256, hash(bytes));
    assert.equal(record.migrations[0].checksum, hash(bytes.toString().replace(/\r\n/g, '\n')));
    assert(source.includes('CREATE TABLE original'));
    assert.deepEqual(createReleaseRecord(root), record);

    await put('unexpected.txt', 'untracked');
    assert.throws(() => createReleaseRecord(root), /clean checkout/);
    await rm(join(root, 'unexpected.txt'));
    await put('apps/api/package.json', '{}');
    assert.throws(() => createReleaseRecord(root), /clean checkout/);
    git('restore', 'apps/api/package.json');
    git('rm', 'apps/web/ASSETS.md');
    git('-c', 'user.name=Inventory test', '-c', 'user.email=inventory@example.invalid',
      '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'missing required material');
    assert.throws(() => createReleaseRecord(root), /required committed/);
  } finally {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert(basename(root).startsWith('codesaga-inventory-'));
    await rm(root, { recursive: true, force: true });
  }
});
