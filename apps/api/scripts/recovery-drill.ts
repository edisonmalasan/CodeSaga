import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { migrate } from '../src/database/migrate';
import { seed } from '../src/database/seed';
import { assertLocalDocker, fixturePort, ownedDatabaseIdentifier, recoveryNames } from './recovery-policy';

const root = resolve(__dirname, '../../..');
const maximumBytes = 8 * 1024 * 1024;

// Binary archive bytes never pass through a shell or a host temporary file.
function docker(args: string[], input?: Buffer): Promise<Buffer> {
  return new Promise((resolveResult, reject) => {
    const child = spawn('docker', args, { cwd: root, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const output: Buffer[] = [];
    let bytes = 0;
    let failure: Error | undefined;
    const timer = setTimeout(() => {
      failure = new Error('Docker recovery command timed out.');
      child.kill();
    }, 30_000);
    child.stdout.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > maximumBytes) { failure = new Error('Recovery command exceeded its fixture output limit.'); child.kill(); }
      else output.push(chunk);
    });
    // Drain diagnostics without exposing archive rows, credentials or SQL in logs.
    child.stderr.resume();
    child.stdin.on('error', () => {}); // Early pg_restore rejection can close stdin.
    child.on('error', () => { clearTimeout(timer); reject(new Error('Cannot start the Docker recovery command.')); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (failure || code !== 0) reject(failure ?? new Error('Docker recovery command failed.'));
      else resolveResult(Buffer.concat(output));
    });
    child.stdin.end(input);
  });
}

async function snapshot(pool: Pool) {
  const records: Record<string, unknown[]> = {};
  for (const table of ['courses', 'chapters', 'lessons', 'lesson_versions', 'schema_migrations']) {
    records[table] = (await pool.query(`SELECT * FROM ${table} ORDER BY ${table === 'schema_migrations' ? 'name' : 'id'}`)).rows;
  }
  const constraints = (await pool.query(`SELECT conrelid::regclass::text AS relation, conname, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY relation, conname`)).rows;
  const indexes = (await pool.query(`SELECT tablename, indexname, indexdef FROM pg_indexes
    WHERE schemaname = 'public' ORDER BY tablename, indexname`)).rows;
  return { records, constraints, indexes };
}

async function main() {
  assert.equal(process.argv.length, 2, 'This rehearsal accepts no database, archive or target arguments.');
  // Refuse overrides before invoking Docker, including contexts targeting remote hosts.
  if (process.env.DOCKER_HOST || process.env.DOCKER_CONTEXT) throw new Error('Docker routing overrides are not supported.');
  const endpoint = JSON.parse((await docker(['context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}'])).toString());
  assertLocalDocker(endpoint, process.env);
  const container = (await docker(['compose', '-f', 'infra/compose.yaml', 'ps', '-q', 'postgres'])).toString().trim();
  assert.match(container, /^[a-f0-9]{12,64}$/, 'Start the local PostgreSQL fixture first.');
  const inspected = JSON.parse((await docker(['inspect', container])).toString());
  const port = fixturePort(inspected[0]);
  const names = recoveryNames(randomUUID().replaceAll('-', ''));
  const created = new Set<string>();
  const pools: Pool[] = [];
  const connection = { host: '127.0.0.1', port, user: 'codesaga', password: 'codesaga_local_only',
    ssl: false as const, max: 1, connectionTimeoutMillis: 3000,
    options: '-c search_path=public', statement_timeout: 10_000, lock_timeout: 3000,
    query_timeout: 15_000, application_name: 'codesaga-recovery-drill' };
  const admin = new Pool({ ...connection, database: 'postgres' });
  let phase = 'create isolated databases';
  let failed = false;
  try {
    for (const name of Object.values(names)) {
      // Names are generated here; ownership is recorded only after CREATE succeeds.
      assert.match(name, /^codesaga_recovery_[a-f0-9]{32}_(source|restore)$/);
      await admin.query(`CREATE DATABASE "${name}" TEMPLATE template0`);
      created.add(name);
      console.log(`Created disposable database: ${name}`);
    }
    const source = new Pool({ ...connection, database: names.source });
    const target = new Pool({ ...connection, database: names.restore });
    pools.push(source, target);
    const pg = (utility: string, database: string, options: string[], input?: Buffer) => {
      ownedDatabaseIdentifier(database, created);
      return docker(['exec', '-i', container, 'env', '-i', 'PATH=/usr/local/bin:/usr/bin:/bin',
        'PGOPTIONS=-c statement_timeout=15000 -c lock_timeout=3000', utility,
        '--host=/var/run/postgresql', '--port=5432', '--username=codesaga', '--no-password',
        `--dbname=${database}`, ...options], input);
    };
    phase = 'initialize original fixture';
    await migrate(source);
    await seed(source);
    await source.query('UPDATE lesson_versions SET body = $1', ['Original restore fixture: café 🧭\n"quotes", \'apostrophes\' and \\ paths.']);
    const before = await snapshot(source);
    phase = 'dump known original fixture';
    const archive = await pg('pg_dump', names.source, ['--format=custom', '--no-owner', '--no-acl']);
    assert.equal(archive.subarray(0, 5).toString(), 'PGDMP');
    // Restoring must recover the snapshot, not later changes to the source DB.
    await source.query('UPDATE courses SET summary = $1', ['Changed after backup.']);
    const restoreOptions = ['--single-transaction', '--exit-on-error', '--no-owner', '--no-acl'];
    phase = 'verify rejected archive and transactional restore failure';
    await assert.rejects(() => pg('pg_restore', names.restore, restoreOptions, Buffer.from('invalid archive')));
    assert.deepEqual((await target.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).rows, []);
    await target.query('CREATE TABLE lesson_versions (sentinel text)');
    await target.query('INSERT INTO lesson_versions VALUES ($1)', ['Keep the pre-restore state.']);
    await assert.rejects(() => pg('pg_restore', names.restore, restoreOptions, archive));
    assert.deepEqual((await target.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).rows,
      [{ tablename: 'lesson_versions' }]);
    assert.deepEqual((await target.query('SELECT sentinel FROM lesson_versions')).rows,
      [{ sentinel: 'Keep the pre-restore state.' }]);
    await target.query('DROP TABLE lesson_versions');
    phase = 'restore and verify rows, ledger, constraints and indexes';
    await pg('pg_restore', names.restore, restoreOptions, archive);
    assert.deepEqual(await snapshot(target), before);
    assert.deepEqual(await migrate(target), []);
    await seed(target);
    assert.deepEqual(await snapshot(target), before);
    await assert.rejects(() => target.query(`INSERT INTO courses SELECT * FROM courses`),
      (error: unknown) => (error as { code: string }).code === '23505');
    await assert.rejects(() => target.query(`INSERT INTO lessons VALUES (gen_random_uuid(), gen_random_uuid(), 'orphan', 0)`),
      (error: unknown) => (error as { code: string }).code === '23503');
    await target.query('UPDATE courses SET summary = $1', ['Restored database accepts writes.']);
    assert.equal((await target.query('SELECT summary FROM courses')).rows[0].summary, 'Restored database accepts writes.');
    console.log('PASS: original rows/Unicode, migration ledger, constraints, indexes, repeat migrate/seed and post-restore writes.');
    console.log('PASS: corrupt archive rejected; conflicting restore rolled back without partial tables or sentinel loss.');
  } catch {
    failed = true;
    console.error(`Recovery rehearsal failed during: ${phase}. Database contents and diagnostics are not logged.`);
  } finally {
    for (const pool of pools) {
      try { await pool.end(); } catch { failed = true; }
    }
    for (const name of created) {
      try {
        await admin.query(`DROP DATABASE ${ownedDatabaseIdentifier(name, created)}`);
        const remaining = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
        assert.equal(remaining.rowCount, 0);
      } catch {
        failed = true;
        console.error(`Cleanup requires attention for disposable database: ${name}`);
      }
    }
    try { await admin.end(); } catch { failed = true; }
  }
  if (failed) process.exitCode = 1;
  else console.log('PASS: both run-owned databases removed; no archive file retained.');
}

void main().catch(() => { console.error('Recovery preflight failed. Check local Docker fixture configuration.'); process.exitCode = 1; });
