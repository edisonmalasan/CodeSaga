import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Pool } from 'pg';

export const migrationsDirectory = resolve(__dirname, '../../migrations');

export async function migrate(pool: Pool, directory = migrationsDirectory): Promise<string[]> {
  const names = (await readdir(directory)).filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
  const migrations = await Promise.all(names.map(async (name) => {
    const sql = await readFile(resolve(directory, name), 'utf8');
    return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') };
  }));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize concurrent migrators before even creating the ledger.
    await client.query("SELECT pg_advisory_xact_lock(1919247463, 1)");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      checksum text NOT NULL CHECK (length(checksum) = 64),
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const applied = await client.query<{ name: string; checksum: string }>('SELECT name, checksum FROM schema_migrations');
    const local = new Map(migrations.map((item) => [item.name, item]));
    for (const row of applied.rows) {
      if (local.get(row.name)?.checksum !== row.checksum) {
        throw new Error(`Migration missing or modified: ${row.name}`);
      }
    }
    const alreadyApplied = new Set(applied.rows.map((item) => item.name));
    const executed: string[] = [];
    for (const migration of migrations) {
      if (alreadyApplied.has(migration.name)) continue;
      await client.query(migration.sql);
      await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
        [migration.name, migration.checksum]);
      executed.push(migration.name);
    }
    await client.query('COMMIT');
    return executed;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
