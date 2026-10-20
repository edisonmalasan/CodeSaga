# AGENTS.md

## Project

- **Name:** CodeSaga
- **Purpose:** Planned original coding-learning platform for learners and project creators, with later reviewer/moderator, educator/student and operator workflows; evidence-based scope is in docs/ROADMAP.md.
- **Current state:** Next.js web and NestJS API source, original public discovery/reading previews, shared schemas/content, a pnpm lockfile, PostgreSQL migrations and local fixtures are implemented. docs/ROADMAP.md owns completion and verification evidence. Identity/execution adapters explicitly report unconfigured. Live learning, account workflows and deployment remain unavailable; autonomous orchestration is active.

## Source of Truth

**Read only the documentation relevant to the task. Do not assume—verify.**

| Source                                  | Read when                                                    |
| --------------------------------------- | ------------------------------------------------------------ |
| `docs/CONTEXT.md`                       | Locating context, constraints, and relevant documentation    |
| `docs/ROADMAP.md`                       | Checking planned features, priorities, or verified progress  |
| `docs/ARCHITECTURE.md` _(if it exists)_ | Making changes to established boundaries or data flows       |
| Source code and tests                   | Determining actual current behavior and verifying a change   |
| `graphify-out/` _(if it exists)_        | Exploring code relationships; verify findings against source |

- Requirements and explicitly approved decisions define **intended behavior**; source code and passing tests provide evidence of **current behavior**.
- If documentation and code conflict, **report the discrepancy** and determine whether the code or documentation needs correction. Never silently rewrite a requirement to justify current code.
- Prefer one authoritative location per fact; link to it rather than copying it into multiple files.

## Tech Stack

_Fill from verified project files. Remove unused rows._

| Layer              | Technology / version      | Evidence        |
| ------------------ | ------------------------- | --------------- |
| Frontend / UI      | Next.js 16.4.2, React 19.3.1, TypeScript 5.9.3; local Silkscreen 5.3.0 | apps/web/package.json; pnpm-lock.yaml; public discovery and reading UI |
| Backend / runtime  | NestJS 11.2.7, pg 8.23.1; Node 24 CI baseline (26.10.0 local) | apps/api/package.json; .nvmrc; actual runtime |
| Database / storage | PostgreSQL 18.6; Redis 8.10.2 and source-built MinIO local fixtures | infra/compose.yaml; apps/api/migrations; production providers undecided |
| Build / tooling    | pnpm 12.6.0 workspace; tsc, Next.js build; Python research/audit utilities | package.json; pnpm-lock.yaml; tsconfig.base.json |
| Tests              | node:test through tsx; PostgreSQL integration; Playwright Chromium/HTTP acceptance | package scripts; apps/*/test; packages/*/test; tests/ |

## Build, Test, and Development Commands

_Use commands that really exist in this repository. Never invent a script._

| Purpose              | Command                   | Evidence / notes |
| -------------------- | ------------------------- | ---------------- |
| Install dependencies | `pnpm install --frozen-lockfile` | Committed workspace manifests and lockfile |
| Run locally          | `pnpm dev` | First run setup/services/migrations from README.md; starts web and API |
| Build                | `pnpm build` | Builds contracts/content, API and Next.js; requires example environment setup |
| Test                 | `pnpm test`; `pnpm test:integration`; `pnpm test:e2e` | Unit/HTTP, real local PostgreSQL, and cross-process checks respectively |
| Lint / type-check    | `pnpm typecheck` | tsc across all packages; no separate linter configured |

Run from the repository root unless a command explicitly requires another directory.

## Architecture Non-Negotiables

_List only **verified** constraints from the repository or approved requirements. Reference `docs/ARCHITECTURE.md` if present. If none are documented, write `Not yet established`—do not manufacture rules._

- The user requires readable frontend and backend architecture, a full roadmap based on retained evidence, and preservation of existing AGENTS rules. The selected core is Next.js, NestJS and PostgreSQL; docs/ARCHITECTURE.md separates the implemented foundation from proposed domain features. Public schemas live in packages/contracts; database credentials and learner execution stay outside frontend bundles. No submitted learner code runs inside the web/API process.

## Working Method (Lightweight ICM)

1. **Orient:** Read `docs/CONTEXT.md`, then only the relevant roadmap section, existing source files, and needed references.
2. **Plan when warranted:** For substantial changes, summarize approach, affected files, risks, and verification criteria before coding. Small, clear fixes do not need separate plan documents.
3. **Implement within scope:** Follow existing conventions and avoid unrelated changes.
4. **Verify:** Run applicable checks; report passed, failed, skipped, and unavailable checks accurately.
5. **Preserve:** Update `docs/ROADMAP.md` only for verified outcomes, and update other authoritative docs only when facts change.

Do not create extra ICM stage folders or permanent plan files unless the task benefits from them.

## Graphify

- Graphify is **derived project knowledge**, not the source of truth for code behavior.
- When available and relevant, query the existing graph to find related symbols and dependencies; inspect source files before acting on results.
- After meaningful structural changes, refresh the graph using the **installed** Graphify skill or CLI workflow. Do not presume Graphify is installed or that a graph exists.
- If exporting to Obsidian, use only this project's generated area: `NOT_CONFIGURED/10 - Projects/CodeSaga/_Graphify/`.
- Never export into the vault root or overwrite curated PARA notes. Refreshing the graph is **not** the same as saving session decisions.

## Obsidian / Cross-Project Knowledge

- **Central vault:** `Not configured or verified in this repository`
- **Project notes:** `10 - Projects/CodeSaga/`, if present.
- Read only relevant notes, when the vault is configured and accessible; repository docs remain authoritative for project-specific requirements.
- Propose meaningful updates after substantial work: project progress/decisions under `10 - Projects`, reusable lessons under `30 - Resources`, unverified ideas under `00 - Inbox`.
- **Ask before editing curated vault notes.** Avoid duplicates, stale claims, secrets, and copying entire chat transcripts.
- If the vault is inaccessible, continue using local project context and mention the limitation.

## Git Workflow

1. **Never commit directly to `main`.** Use task branches prefixed with `feat/`, `fix/`, `chore/`, `docs/`, or `refactor/`.
2. Before modifying files, check `git status`, switch to `main`, pull the latest `origin/main`, create a task branch, and push it with upstream tracking.
3. Commit at logical checkpoints and push changes to the remote.
4. Use the `git` subagent when available; otherwise, use permitted Git tools.
5. After implementation, run relevant tests, resolve issues, and **merge verified work into `main`**. Follow required CI checks and branch protections.
6. Never discard existing changes, force-push, or commit temporary agent-generated plans unless explicitly authorized.
7. **Do not consider a task complete until it is verified, merged, and reflected in `docs/ROADMAP.md`.**

### Branch Lifecycle

```bash
git status
git switch main
git pull --ff-only origin main
git switch -c <branch-name>
git push -u origin <branch-name>
```

If the working tree is dirty or Git operations are blocked, resolve safely without overwriting existing work.

---

## Autonomous Orchestration Mode

_Activate only when the user explicitly requests autonomous roadmap execution._

**Status: Active**, explicitly authorized by the user on 2026-10-20. Execute eligible roadmap tasks continuously using the rules below; record verified outcomes and blockers in `docs/ROADMAP.md`.

1. **Orchestrator:** Read `docs/CONTEXT.md` and `docs/ROADMAP.md`, select the next eligible task, manage Git operations, and verify completion.
2. **Subagent:** Spawn **subagents** per task if needed when supported. Otherwise, perform the work directly.
3. **Execution:** Create branch → Implement → Test → Commit → Push → Merge → Update roadmap.
4. **Continuity:** Automatically proceed to the next eligible roadmap task. **Do not stop after one feature or merge.**
5. **Blockers:** Attempt safe recovery. Pause only for unresolved errors, missing requirements, permissions, required approvals, or unsafe operations. Continue independent tasks when possible.
6. **Completion:** Stop when all authorized tasks are finished, remaining tasks are deferred or blocked, or the user stops execution.
7. **Knowledge:** Update relevant documentation, preserve reusable lessons in Obsidian, and refresh Graphify after significant changes.
