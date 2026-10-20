# CodeSaga API

NestJS 11 foundation. `GET /health` reports process liveness; `GET /ready` queries PostgreSQL and returns HTTP 503 with `DATABASE_UNAVAILABLE` if the database is unavailable. Both success responses use `healthSchema` from `@codesaga/contracts`. All errors use that package's `apiErrorSchema`, with a matching `X-Request-ID` response header. These operational routes are unprefixed; domain API routes have not been introduced.

## Local use

Run from the repository root after the workspace dependencies and contracts build are available:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
docker compose -f infra/compose.yaml up -d --wait
pnpm --filter @codesaga/api db:migrate
pnpm --filter @codesaga/api db:seed
pnpm --filter @codesaga/api dev
```

The API listens at `http://127.0.0.1:4000`. Its browser origin allowlist defaults in the example to `http://localhost:3000`. Redis and MinIO are local infrastructure fixtures for later work; the API currently depends only on PostgreSQL. There is no login or code execution service.

| Setting | Behavior |
| --- | --- |
| `DATABASE_URL` | Required PostgreSQL URL with a host, user and database path; never sent to web clients |
| `CORS_ORIGINS` | Required comma-separated exact HTTP(S) origins; paths, credentials and wildcards rejected; production requires HTTPS |
| `PORT` | Integer 1–65535; default 4000 |
| `HOST` | Explicit loopback/wildcard bind address; default `127.0.0.1` |
| `NODE_ENV` | `development`, `test` or `production`; default `development` |

Startup failures identify invalid setting names without printing their values. `dev`, `start` and database commands load `apps/api/.env` if present. A caller's request ID is accepted only if it contains 1–128 ASCII letters, digits, `.`, `_` or `-`; otherwise a UUID is generated. Requests to the operational routes must have an empty query. Request bodies are bounded at 64 KiB, and JSON parse failures share the public error envelope. CORS allows only configured origins; requests without an Origin header remain available to local/server health probes. CORS is not authentication.

## Database ownership

SQL lives in `migrations/`. The runner takes a PostgreSQL transaction advisory lock, initializes `schema_migrations`, validates stored SHA-256 checksums, applies pending SQL, and records history in the same transaction and connection. A failed batch rolls everything back. Applied migrations must never be edited or removed; add a new migration instead. Concurrent runner invocations serialize, and repeated successful runs do nothing.

The first migration creates courses, chapters, lessons and lesson versions with ordered-reference, slug, version and foreign-key constraints. `db:seed` adds one original draft course/chapter/lesson and version in a transaction. Repeated seeding preserves existing content. No account records or reference-product content are created. Publication and immutability workflows belong to later content milestones.

## Verification

```powershell
pnpm --filter @codesaga/api typecheck
pnpm --filter @codesaga/api test
pnpm --filter @codesaga/api build
$env:TEST_DATABASE_URL='postgresql://codesaga:codesaga_local_only@127.0.0.1:5432/codesaga'
pnpm --filter @codesaga/api test
```

`test` uses `tsx` and Node's test runner. It tests environment failures/redaction, HTTP liveness/readiness, request IDs, query validation, error sanitization, CORS and JSON limits. With `TEST_DATABASE_URL`, it also creates unique temporary schemas, tests clean/concurrent migrations, seed idempotency, constraints, live readiness, transaction rollback and checksum mismatch, then removes only those test schemas. Use a disposable local database with schema creation privileges. The database suite reports an explicit skip when the variable is absent.

`build` uses TypeScript with legacy decorators and emitted metadata; `reflect-metadata` is loaded before the application. Explicit injection tokens also keep development and tests compatible with `tsx`, which does not emit TypeScript decorator metadata. Shutdown hooks close the PostgreSQL pool.

## Version evidence

Exact package pins are in `package.json`; the workspace owns the lockfile. NestJS 11.2.7 is the latest stable 11.x release observed in the [official npm registry](https://registry.npmjs.org/@nestjs/core) on 2026-10-20; NestJS 12 is outside this task. TypeScript 5.9.3 is the coordinator-selected decorator baseline. Implementation references: [Nest exception filters](https://docs.nestjs.com/exception-filters), [node-postgres transactions](https://node-postgres.com/features/transactions), and [Zod validation](https://zod.dev/basics).
