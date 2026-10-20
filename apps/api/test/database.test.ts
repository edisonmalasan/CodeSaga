import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Pool } from 'pg';
import { migrate, migrationsDirectory } from '../src/database/migrate';
import { seed } from '../src/database/seed';
import { createApp } from '../src/app';
import { readConfig } from '../src/config';

const connectionString = process.env.TEST_DATABASE_URL;

test('isolated PostgreSQL migrations and seed', {
  skip: !connectionString ? 'Set TEST_DATABASE_URL to a disposable local PostgreSQL database' : false,
}, async (t) => {
  const admin = new Pool({ connectionString, connectionTimeoutMillis: 2000 });
  t.after(() => admin.end());

  async function isolated(run: (pool: Pool) => Promise<void>) {
    const schema = `test_${randomUUID().replaceAll('-', '')}`;
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const pool = new Pool({ connectionString, options: `-c search_path=${schema}`, max: 4 });
    try { await run(pool); }
    finally {
      await pool.end();
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    }
  }

  await t.test('clean migration, concurrent re-run, idempotent original seed, constraints and live readiness', async () => {
    await isolated(async (pool) => {
      assert.deepEqual(await migrate(pool), ['0001_content_catalog.sql']);
      assert.deepEqual(await Promise.all([migrate(pool), migrate(pool)]), [[], []]);
      await seed(pool);
      await seed(pool);
      const rows = await pool.query(`SELECT (SELECT count(*) FROM courses)::int AS courses,
        (SELECT count(*) FROM chapters)::int AS chapters,
        (SELECT count(*) FROM lessons)::int AS lessons,
        (SELECT count(*) FROM lesson_versions)::int AS versions,
        (SELECT count(*) FROM schema_migrations)::int AS migrations`);
      assert.deepEqual(rows.rows[0], { courses: 1, chapters: 1, lessons: 1, versions: 1, migrations: 1 });
      assert.equal((await pool.query('SELECT status FROM courses')).rows[0].status, 'draft');
      await assert.rejects(() => pool.query(`INSERT INTO chapters (id, course_id, slug, title, position)
        VALUES (gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001', 'duplicate', 'Duplicate', 0)`),
      (error: unknown) => (error as { code: string }).code === '23505');
      await assert.rejects(() => pool.query(`INSERT INTO lessons (id, chapter_id, slug, position)
        VALUES (gen_random_uuid(), gen_random_uuid(), 'orphan', 0)`),
      (error: unknown) => (error as { code: string }).code === '23503');

      const app = await createApp(readConfig({ NODE_ENV: 'test', DATABASE_URL: connectionString,
        CORS_ORIGINS: 'http://localhost:3000' }), {
        async check() { await pool.query('SELECT 1'); }, async close() {},
      });
      try {
        await app.listen(0, '127.0.0.1');
        assert.equal((await fetch(`${await app.getUrl()}/ready`)).status, 200);
      } finally { await app.close(); }
    });
  });

  await t.test('failed SQL rolls back the catalog and migration ledger together', async () => {
    await isolated(async (pool) => {
      const directory = await mkdtemp(join(tmpdir(), 'codesaga-migrations-'));
      try {
        await cp(migrationsDirectory, directory, { recursive: true });
        await writeFile(join(directory, '0002_failure.sql'), 'CREATE TABLE must_rollback (id integer); SELECT * FROM no_such_table;');
        await assert.rejects(() => migrate(pool, directory));
        const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()`);
        assert.deepEqual(result.rows, []);
      } finally {
        assert.ok(directory.startsWith(join(tmpdir(), 'codesaga-migrations-')));
        await rm(directory, { recursive: true, force: true });
      }
    });
  });

  await t.test('migration checksum rejects edited history without changing data', async () => {
    await isolated(async (pool) => {
      await migrate(pool);
      const directory = await mkdtemp(join(tmpdir(), 'codesaga-migrations-'));
      try {
        await cp(migrationsDirectory, directory, { recursive: true });
        await writeFile(join(directory, '0001_content_catalog.sql'), '-- changed history');
        await assert.rejects(() => migrate(pool, directory), /Migration missing or modified/);
        assert.equal((await pool.query('SELECT count(*)::int AS count FROM schema_migrations')).rows[0].count, 1);
      } finally {
        assert.ok(directory.startsWith(join(tmpdir(), 'codesaga-migrations-')));
        await rm(directory, { recursive: true, force: true });
      }
    });
  });
});
