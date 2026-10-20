# CodeSaga

An original browser-based coding-learning platform for self-directed beginners.

## Development status

The foundation is being implemented: a Next.js frontend, a separate NestJS API and PostgreSQL, with shared public transport schemas. The root route currently returns a development-stage JSON response; learner-facing pages follow in M02. Sign-in, code execution, progress, Builds and commerce are not shipped.

See [the roadmap](docs/ROADMAP.md) for verified outcomes, [architecture](docs/ARCHITECTURE.md) for boundaries and decisions, and [context](docs/CONTEXT.md) for navigation. Autonomous roadmap execution is active under [AGENTS.md](AGENTS.md).

## Run locally

Use Node.js 24 LTS, pnpm 12.6.0 and Docker Compose v2 with a running Linux engine. Node.js 26.10.0 is also used for local verification; CI uses `.nvmrc` (24). Install the exact pnpm version using your preferred Node package manager if it is not already available.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm setup:local
pnpm services:up
pnpm services:verify
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The first service startup builds the pinned MinIO source release and downloads its Go dependencies. Subsequent starts reuse the image. `setup:local` copies the two `.env.example` files without replacing existing `.env` files; their values are disposable local development fixtures.

| Service | Address | Purpose |
|---|---|---|
| Web | `http://localhost:3000` | Next.js frontend; `/health` is liveness |
| API | `http://127.0.0.1:4000` | `/health` is liveness; `/ready` checks PostgreSQL |
| PostgreSQL | `127.0.0.1:5432` | Durable application data and migration ledger |
| Redis | `127.0.0.1:6379` | Local fixture for later queue consumers |
| MinIO | `http://127.0.0.1:9000` | Private local fixture for later object consumers |

Database, Redis and object ports bind only to loopback. They have project-scoped persistent Docker volumes. `pnpm services:down` stops the project services and preserves those volumes. No production credentials, cloud accounts or hosting provider are required for the foundation.

The seed is original CodeSaga draft content and is idempotent. A seed is not a published course. Migrations use a checksum ledger and transaction lock; changed applied migrations fail rather than silently rewriting history.

## Verify

With the local services running and environment files created:

```sh
pnpm verify
pnpm test:e2e
```

`verify` runs type checks, unit/HTTP tests, real PostgreSQL integration tests, production builds and a web dependency/client boundary audit. Integration tests create and remove isolated schemas in the local database; the wrapper rejects non-local database URLs. `test:e2e` starts the web and API processes itself, so stop existing development servers on ports 3000/4000 first.

| Command | Scope |
|---|---|
| `pnpm typecheck` | All application and contract TypeScript |
| `pnpm test` | Package tests; database suite skips without `TEST_DATABASE_URL` |
| `pnpm test:integration` | Required real database checks; fails if the local database is unavailable |
| `pnpm build` | Shared contracts, API and Next.js production build |
| `pnpm audit:boundaries` | Built web traces/client chunks exclude backend/reference configuration |
| `pnpm test:e2e` | Real processes and HTTP health/readiness/error contracts |

`.github/workflows/verify.yml` runs the same foundation pipeline on Linux using isolated service fixtures. A configured workflow is not evidence that a remote run has passed; see the roadmap for recorded verification.

## Repository boundaries

```text
apps/web/          Next.js server routes and future learner UI
apps/api/          NestJS transport, configuration and database services
packages/contracts/ Public Zod schemas shared by API and web
infra/             Local PostgreSQL, Redis and MinIO fixtures
scripts/           Setup, integration runner and production boundary audit
tests/             Cross-process acceptance tests
docs/              Context, roadmap and architecture
```

Identity, execution, payment, AI and hosting choices remain explicit decisions. No learner-submitted code runs in the web/API process. Original curriculum, branding and assets must be used. The ignored local research archive is not part of a checkout or a production bundle.
