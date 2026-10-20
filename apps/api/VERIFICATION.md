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

## M02 content API and unavailable provider boundaries — 2026-10-20

The coordinator opened the application-edit gate after M01 merged (`0d6b57a`) and created the task branch. This worker changed only `apps/api/**` plus ignored preparation under `.local/backend-prep`; root owns shared contracts, installation/lockfile, roadmap, Git and final CI/merge, and the UI/content worker owns authored data. The earlier M01 report above remains historical evidence.

Implemented: `src/content` published read service/controller; `src/integrations` provider-neutral session/execution ports and explicit unavailable implementations/controller; registration in `app.ts`; fixed public error mapping in `http.ts`; `@codesaga/content` workspace dependency; adapter/HTTP tests; README route reference and [provider setup checklist](PROVIDER_SETUP.md). All public request/response schemas are imported from `@codesaga/contracts`.

| Check | Observed result |
| --- | --- |
| `pnpm --filter @codesaga/api exec tsx --test test/integrations.test.ts` | 2 passed; anonymous/forged credentials and source snapshots always reject |
| Initial API typecheck before authored content build | Failed solely with missing `@codesaga/content` export/types; resolved after coordinator linked/built the dependency |
| `pnpm --filter @codesaga/api typecheck` after dependency build | Passed |
| `pnpm --filter @codesaga/api test` without test DB URL | 17 passed, 0 failures, 1 explicit PostgreSQL-suite skip |
| `pnpm --filter @codesaga/api build` | Passed |
| Compiled `dist/app.js` smoke on ephemeral loopback port | Passed: authored catalog 200, identity/execution unavailable capabilities, valid execution command 503 with matching request ID, database independence, graceful close |
| `git diff --check -- apps/api` | Passed |
| API source review/search for process launch/evaluator APIs | No `child_process`, `node:vm`, `eval`, `spawn`, `execFile` or worker-thread execution path found |

New HTTP coverage validates every published authored course/chapter/reading lesson/resource with shared schemas; course aliases retain identity/canonical path; wrong-parent/unknown/invalid/upcoming-course lesson lookups cannot manufacture bodies; unexpected queries fail; the M01 draft ID/slug is absent; authored reads do not invoke database checks. Tests verify both capability flags stay false/not_configured with no runtimes; forged cookie/bearer values cannot create a principal; no session cookie is issued; validated execution requests return sanitized ID-bearing 503 and invalid/oversize source fields return 400. Existing HTTP tests retain malformed JSON/64 KiB limits and unexpected-error redaction.

Limitations: no provider was selected, provisioned or tested; no live sign-in/session, execution/output/stdin/cancel, grading/completion/XP, session mutation/CSRF flow, admission/quota policy or independent-session restoration is claimed. Upcoming course metadata is intentional; lesson bodies require published preview availability. This slice does not read the infrastructure draft or change database history. PostgreSQL integration was not rerun by this worker because database code/migrations did not change; root owns broader integration and CI/merge evidence. The provider checklist specifies required setup decisions and secret categories; exact provider-specific environment names await provider selection. There is no availability toggle or local code-execution fallback.
