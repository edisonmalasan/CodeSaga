# CodeSaga

An original browser-based coding-learning platform for self-directed beginners.

## Development status

The Next.js frontend includes original course discovery and static reading previews. A separate NestJS API serves validated published content, alongside the verified PostgreSQL foundation and shared public transport schemas. Sign-in, code execution, progress, Builds and commerce are not shipped.

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

The database seed is original CodeSaga draft content and is idempotent. Published reading previews have a separate authority: validated original records in `packages/content`. Public routes never expose the infrastructure draft seed. Migrations use a checksum ledger and transaction lock; changed applied migrations fail rather than silently rewriting history.

## Public discovery and integrations

Browse `/courses`, open Python or HTML/CSS reading previews, or visit `/resources`, `/tutorials`, `/blog`, `/search`, `/about`, `/help` and `/pricing`. JavaScript, SQL and Git are explicitly upcoming. The examples are static; reading does not award completion or XP. Theme, motion and optional navigation sound preferences are browser-local.

The web server fetches validated public content from the separate API. API outages produce a reading error state. `/api/v1/capabilities` reports identity and execution as unconfigured. Session and valid execution requests return typed 503 responses; no account or code job is created. See [provider setup requirements](apps/api/PROVIDER_SETUP.md) for the decisions and configuration needed to enable these integrations.

## Verify

With the local services running and environment files created:

```sh
pnpm verify
pnpm test:e2e
```

`verify` runs type checks, unit/HTTP tests, real PostgreSQL integration tests, production builds and a web dependency/client boundary audit. Integration tests create and remove isolated schemas in the local database; the wrapper rejects non-local database URLs. `test:e2e` starts separate web and API processes itself, so stop existing development servers on ports 3000/4000 first. With `CI=true`, it starts the compiled production servers after `pnpm build`; otherwise it uses development servers. Shutdown is bounded and the acceptance step has a CI timeout.

| Command | Scope |
|---|---|
| `pnpm typecheck` | Applications, packages and acceptance-test TypeScript |
| `pnpm test` | Package tests; database suite skips without `TEST_DATABASE_URL` |
| `pnpm test:integration` | Required real database checks; fails if the local database is unavailable |
| `pnpm db:rehearse-restore` | Local PostgreSQL dump/restore, rollback and cleanup drill using two disposable databases; [scope and recovery notes](infra/RECOVERY.md) |
| `pnpm build` | Shared contracts/content, API and Next.js production build |
| `pnpm audit:boundaries` | Built web traces/client chunks exclude backend/reference configuration |
| `pnpm test:e2e` | Chromium discovery/reading/keyboard/storage/media journeys and cross-process HTTP contracts |

Install the matching browser once with `pnpm exec playwright install chromium` before local browser acceptance. CI installs Chromium and its Linux dependencies. `.github/workflows/verify.yml` runs the pipeline on Linux using isolated service fixtures. A configured workflow is not evidence that a remote run has passed; see the roadmap for recorded verification.

## Repository boundaries

```text
apps/web/          Next.js public discovery, reading and interactive controls
apps/api/          NestJS public content, unavailable integration adapters and database services
packages/contracts/ Public Zod schemas shared by API and web
packages/content/   Original published content and relationship validation
infra/             Local PostgreSQL, Redis and MinIO fixtures
scripts/           Setup, integration runner and production boundary audit
tests/             Cross-process acceptance tests
docs/              Context, roadmap and architecture
```

Identity, execution, payment, AI and hosting choices remain explicit decisions. No learner-submitted code runs in the web/API process. Original curriculum, branding and assets must be used. The ignored local research archive is not part of a checkout or a production bundle.
