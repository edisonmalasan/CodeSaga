# API and infrastructure verification — 2026-10-20

Scope: `apps/api/**` and `infra/**` for M01. The coordinator owns workspace installation, shared schemas, web, roadmap updates and Git integration. This report records worker checks, not a CI or deployment claim.

| Command / check | Observed result |
| --- | --- |
| `pnpm --filter @codesaga/api typecheck` | Passed |
| `pnpm --filter @codesaga/api build` | Passed; TypeScript 5.9.3, decorators and metadata enabled |
| `pnpm --filter @codesaga/api test` without test DB URL | 11 passed, 1 explicit database-suite skip |
| `pnpm --filter @codesaga/api test` with local `TEST_DATABASE_URL` | 15 passed, 0 failures, 0 skips |
| Compiled `dist/app.js` smoke check on ephemeral loopback port | `/health` 200 and `/ready` 200 against real PostgreSQL; graceful close completed |
| `pnpm --filter @codesaga/api db:migrate` twice | First run applied 1 migration, repeat applied 0 |
| `pnpm --filter @codesaga/api db:seed` twice | Both completed; original draft fixture retained without duplicates |
| `docker compose -f infra/compose.yaml config --quiet` | Passed |
| `docker compose -f infra/compose.yaml up -d --wait postgres redis` | Both healthy |
| PostgreSQL version query | PostgreSQL 18.6 |
| `docker compose -f infra/compose.yaml exec -T redis redis-cli ping` | `PONG` |
| `node --check infra/verify-object-store.mjs` | Passed |

The HTTP tests exercise shared success/error schemas, preserved/generated request IDs, missing routes, rejected query parameters, exact CORS origin matching, preflight, malformed JSON, the 64 KiB body limit, sanitized 500 errors, database-outage 503 and independent liveness. Real network failure uses a local unavailable PostgreSQL endpoint; real successful readiness also runs against the fixture database.

Environment tests cover missing database/origin settings, malformed/non-PostgreSQL URLs, invalid ports, invalid bind/environment values, CORS wildcards/paths/credentials, production HTTP origins and error-value redaction. A URL-refinement bug discovered by negative testing was fixed before the passing results above.

The database tests create uniquely named isolated PostgreSQL schemas and remove them afterward. They exercise clean migration history, concurrent repeated migration, repeated seed, uniqueness and foreign-key integrity, transaction rollback of the initial catalog and ledger on failed SQL, and rejection of modified migration checksums. The permanent local fixture contains one original draft course/chapter/lesson/version and no user records.

Source checkpoint: stable. The worker transferred the ongoing MinIO source build and object check to coordinator integration. The coordinator subsequently confirmed all three services healthy and ran `pnpm services:verify`: signed bucket creation, object write/read and object/bucket cleanup passed. Clean-checkout and remote CI evidence remain in the roadmap. Production hosting/provider integration and code execution are outside this worker scope.
