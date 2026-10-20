# Source inventory and release handoff

This repository currently delivers original public discovery and static reading previews. The [roadmap](ROADMAP.md) owns verified scope and open gates. There is no deployed CodeSaga environment, interactive alpha approval, launch date or support SLA. This handoff preserves reproducible source evidence; deployment remains a separate decision.

## Generate an inventory

From a clean committed checkout at the repository root:

```sh
pnpm release:record
```

The command emits JSON to stdout and accepts no target or output arguments. To retain a local copy after `pnpm setup:local` has created the ignored `.local` directory:

```sh
pnpm --silent release:record > .local/release-record.json
```

It records the Git commit/tree, actual generator Node version, declared CI Node major and pnpm pin, exact package-manifest versions/dependencies, and SHA-256 hashes/byte lengths for explicitly selected source materials. The lockfile, original catalog and seed, migration files, service definitions, original media/license/provenance, provider/telemetry/recovery guidance, architecture, roadmap and this handoff are identified. Migration checksums normalize CRLF to LF like the migration runner; material hashes identify the exact committed bytes.

Files are read through Git at the recorded commit, not by recursively scanning a working directory. Ignored environments, raw research, local captures, database rows, credentials and build outputs are excluded. Non-ignored untracked or modified/staged files cause failure. Required missing materials, unrecognized migration names and unpinned direct dependencies also fail. Local environment files may still influence builds: this inventory does not attest their configuration or certify an arbitrary local build.

## Retrieve CI evidence

The [Verify workflow](../.github/workflows/verify.yml) runs installation/setup, isolated services and object round-trip, repeated migration/seed, `pnpm verify`, the actual recovery rehearsal, production browser acceptance and service cleanup. Only after those steps succeed does it generate and upload a single JSON artifact named `source-inventory-<full-commit-sha>`, retained for 14 days. Only the explicitly named runner-temp JSON file is uploaded; no directory, logs, environment or research archive is included.

Download a specific run's artifact with the [GitHub CLI artifact command](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts):

```sh
gh run view RUN_ID
gh run download RUN_ID -n source-inventory-FULL_COMMIT_SHA -D .local/release-evidence/RUN_ID
```

Replace the placeholders with the reviewed run and exact SHA. Check the workflow's final conclusion, all required steps (including cleanup/upload), and the inventory's source commit against the intended release. Use that run's logs for actual outcomes/counts, warnings and explicit skips. The JSON deliberately says `assertedByGenerator: false`: running the generator alone does not run tests, prove workflow success or grant approval. Artifact metadata and digest are supplied by [GitHub's upload action](https://github.com/actions/upload-artifact); this file is not a signed release attestation, SBOM or binary/image digest inventory. A pull-request run may identify its tested merge commit; compare the actual tested SHA rather than assuming it is the branch tip.

Artifact expiration is a CI storage setting, not an approved learner-data retention policy. Preserve needed release evidence through the eventual approved release process before expiration; do not publish private workflow logs or local configuration.

## Review before any deployment

| Area | Current authority / remaining gate |
| --- | --- |
| Delivered scope and limits | [Roadmap](ROADMAP.md), including each unchecked milestone; reading is static and no account/execution/progress/Build/commerce flow is shipped |
| Dependencies and original materials | Inventory package pins/lockfile hashes and [asset provenance](../apps/web/ASSETS.md); choose actual production image/artifact digests separately |
| Web/API boundaries | [Architecture](ARCHITECTURE.md); verify approved origins, separate secrets/environments and compatible release revisions |
| Schema/fixtures | `apps/api/migrations`, checksum ledger and original draft seed; published catalog remains source-controlled and separate |
| Recovery | [Local recovery runbook](../infra/RECOVERY.md); production backups/PITR, RPO/RTO, projections/queues/provider recovery remain open |
| Diagnostics | [Request telemetry](../apps/api/TELEMETRY.md); collector/access/retention, metrics/alerts, incident and support ownership remain open |
| Providers and feature availability | [Provider setup](../apps/api/PROVIDER_SETUP.md); adapters remain rejecting until owned integrations and policies pass their gates |
| Release approval | Required repository review/checks and an explicitly approved deployment target, operating policies and deferrals; no such approval is encoded by this inventory |

## Rollback limits

For the current source-controlled public content, select a previously verified revision or a reviewed corrective change and repeat the full verification workflow. A Git revision identifies its matching API, web, content, contracts and migration files; it does not automatically restore a database or roll back deployed infrastructure. No automated publication rollback service exists.

Migrations have no `down` command. Never edit applied migration history or assume older application code is compatible with a newer database. Use a reviewed forward migration where needed; any database restoration must use a separately approved backup/restore procedure for the intended environment. The implemented rehearsal targets only its own local disposable databases. Hosting-specific deployment/revert, production restoration, compatibility checks and support ownership must be implemented and exercised before a live release.
