# Local service fixtures

From the repository root:

```powershell
docker compose -f infra/compose.yaml up -d --wait
docker compose -f infra/compose.yaml ps
node infra/verify-object-store.mjs
docker compose -f infra/compose.yaml down
```

The Compose project is `codesaga`. It uses named volumes and only publishes loopback ports. `down` preserves the volumes. The checked-in credentials are disposable local fixture values; they are not production configuration.

| Service | Version | Host endpoint | Health check |
| --- | --- | --- | --- |
| PostgreSQL | `18.6-alpine` | `127.0.0.1:5432` | `pg_isready` |
| Redis | `8.10.2-alpine` | `127.0.0.1:6379` | `redis-cli ping` |
| MinIO | source tag `RELEASE.2025-10-15T17-29-55Z` | `http://127.0.0.1:9000` | `/minio/health/ready` |

`POSTGRES_PORT`, `REDIS_PORT` and `MINIO_PORT` can override host ports. Match a changed PostgreSQL port in `apps/api/.env`. PostgreSQL 18 stores its volume at `/var/lib/postgresql`; database migrations and catalog seeding run through the API package scripts after services are healthy.

Redis has append-only persistence. MinIO runs as UID 10001, persists `/data`, and disables the browser console. Its local S3 root user is `codesaga_local`; the local password is `codesaga_minio_local_only`. Buckets and application object/queue adapters are deliberately introduced with the milestone that uses them. This foundation verifies service readiness and does not expose upload, queue-job or execution endpoints.

`node infra/verify-object-store.mjs` checks local MinIO readiness, creates a uniquely named temporary bucket, signs S3 object writes and reads with the fixture credentials, verifies the original probe content, and removes its object and bucket. It accepts only a local port override through `MINIO_PORT` and never reads production endpoints or credentials.

The first startup builds MinIO from the pinned upstream security release using a multi-stage Dockerfile. This requires network access for the Go builder and dependencies and can take several minutes. Subsequent startups use the built image. Upstream provides the latest security release as source and [instructs container users to build it](https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z), so the fixture does not depend on a nonexistent release image. Build dependencies remain outside the final Alpine image. The release uses MinIO's upstream AGPLv3 license; this is a local development fixture, not a hosting/provider decision.

Image version sources checked on 2026-10-20: [official PostgreSQL image](https://hub.docker.com/_/postgres), [official Redis image](https://hub.docker.com/_/redis), [official Go image](https://hub.docker.com/_/golang), and the MinIO release linked above. Hosting, production secrets, backups and managed providers remain deferred.
