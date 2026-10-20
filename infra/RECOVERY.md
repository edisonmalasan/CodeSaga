# Local PostgreSQL recovery rehearsal

Run from the repository root after dependency installation and local Docker startup:

```sh
docker compose -f infra/compose.yaml up -d --wait postgres
pnpm db:rehearse-restore
```

The command creates two uniquely named databases in this repository's PostgreSQL fixture. It discovers the fixture through the local Docker context, validates the Compose project/service/image and single loopback port binding, and uses the checked-in disposable fixture role. It does not consume application database URLs or accept database/archive arguments. Explicit Docker host/context overrides and remote socket endpoints are rejected.

## What it verifies

1. Creates source and restore databases from `template0`; records ownership only after each creation succeeds and prints their disposable names.
2. Runs the actual application migrations and original draft seed in the source; adds Unicode, newline and quoting content to exercise byte preservation.
3. Captures rows as database-generated JSON text, migration names/checksums/timestamps, constraint definitions and index definitions. This preserves timestamp microseconds instead of rounding through the driver's JavaScript dates; a one-microsecond drift must fail comparison. Takes a custom-format `pg_dump` archive, then changes the source to prove the restore represents the backup point.
4. Rejects an invalid archive. Attempts a restore into a deliberately conflicting disposable target and verifies rollback: no partial application tables and no loss of the sentinel row. Expected failures must match PostgreSQL's archive/table-conflict diagnostics; Docker transport failures do not count as successful negative checks. Bounded internal diagnostics are not printed.
5. Restores into the empty disposable target. Compares the restored snapshot, repeats migration/seed without changes, checks primary/foreign-key enforcement and verifies a post-restore write.
6. Closes pools, removes only successfully created databases owned by that invocation, and verifies their absence. Failed verification or cleanup exits nonzero. Binary archives are bounded to 8 MiB in memory; command execution is bounded to 30 seconds. No archive is written to disk.

The rehearsal uses PostgreSQL 18's [custom dump format](https://www.postgresql.org/docs/18/app-pgdump.html) and [single-transaction, exit-on-error restoration](https://www.postgresql.org/docs/18/app-pgrestore.html). Restoration is limited to the archive just generated from the original fixture. It does not ingest arbitrary backups.

The raw-text snapshot avoids [node-postgres timestamp conversion limits](https://node-postgres.com/features/types) using PostgreSQL's [JSON construction functions](https://www.postgresql.org/docs/18/functions-json.html); numeric values also stay in database-generated text rather than being reparsed as JavaScript numbers.

## Failure handling

- Missing Docker/fixture, changed image/labels, exposed or ambiguous port binding, remote context and invalid arguments fail preflight before database creation.
- On a failure after creation, normal exception handling closes pools and attempts cleanup; a cleanup failure prints each affected disposable database name and returns nonzero. It never broadens cleanup to earlier runs.
- Process termination or machine failure can leave temporary databases. Use the printed names to inspect that specific run; do not delete databases merely because their names share a prefix. This read-only inventory is useful after an interruption:

```sh
docker compose -f infra/compose.yaml exec -T postgres psql -U codesaga -d postgres -c "SELECT datname FROM pg_database WHERE datname LIKE 'codesaga_recovery_%';"
```

## Scope and open launch work

This is a local logical database recovery drill for the current migration-backed foundation. Public reading content is source-controlled in `packages/content`, independently of the draft PostgreSQL seed; restoring this fixture does not publish or recover the catalog source tree.

It does not establish production backups, retention, encryption, offsite copies, role/tablespace restoration, point-in-time recovery, recovery point/time objectives, full environment recovery or operational ownership. Learner/Build/job/billing data, projections, queues and published objects do not exist in the current database slice and require their own recovery exercises when implemented. Production choices remain part of M16/D15 in the [roadmap](../docs/ROADMAP.md).

CI runs the rehearsal against its disposable PostgreSQL service after the main verification step, with a two-minute step timeout. Unit cases cover database-name ownership and fixture/context guards; the rehearsal supplies the real dump/restore, rollback and cleanup evidence.
