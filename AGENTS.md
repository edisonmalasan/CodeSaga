# AGENTS.md

## Project

- **Name:** CodeSaga
- **Purpose:** Planned original coding-learning platform for learners and project creators, with later reviewer/moderator, educator/student and operator workflows; evidence-based scope is in docs/ROADMAP.md.
- **Current state:** Documentation-only repository: local research and populated planning docs; no application source, manifest, installed app stack, database, build/test scripts or deployed service verified. All implementation milestones are not started.

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
| Frontend / UI      | Not implemented; proposed frontend is documented separately        | Repository inventory; docs/ARCHITECTURE.md distinguishes proposed from installed technology |
| Backend / runtime  | Not implemented; proposed backend is documented separately         | Repository inventory; docs/ARCHITECTURE.md distinguishes proposed from installed technology |
| Database / storage | Not configured        | Repository inventory; docs/ARCHITECTURE.md distinguishes proposed from installed technology |
| Build / tooling    | No application toolchain configured; Python research/audit utilities exist           | Repository inventory; docs/ARCHITECTURE.md distinguishes proposed from installed technology |
| Tests              | No application test framework configured; offline evidence audit available | Repository inventory; docs/ARCHITECTURE.md distinguishes proposed from installed technology |

## Build, Test, and Development Commands

_Use commands that really exist in this repository. Never invent a script._

| Purpose              | Command                   | Evidence / notes |
| -------------------- | ------------------------- | ---------------- |
| Install dependencies | `Not available`     | No application manifest/scripts exist at initialization; update only from verified project files     |
| Run locally          | `Not available`         | No application manifest/scripts exist at initialization; update only from verified project files     |
| Build                | `Not available`       | No application manifest/scripts exist at initialization; update only from verified project files     |
| Test                 | `Not available`        | No application manifest/scripts exist at initialization; update only from verified project files     |
| Lint / type-check    | `Not available` | No application manifest/scripts exist at initialization; update only from verified project files     |

Run from the repository root unless a command explicitly requires another directory.

## Architecture Non-Negotiables

_List only **verified** constraints from the repository or approved requirements. Reference `docs/ARCHITECTURE.md` if present. If none are documented, write `Not yet established`—do not manufacture rules._

- The user requires readable frontend and backend architecture, a full roadmap based on retained evidence, and preservation of existing AGENTS rules. docs/ARCHITECTURE.md is a proposed design, not an installed/approved implementation. No additional implemented architecture constraints are yet established.

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

1. **Orchestrator:** Read `docs/CONTEXT.md` and `docs/ROADMAP.md`, select the next eligible task, manage Git operations, and verify completion.
2. **Subagent:** Spawn **subagents** per task if needed when supported. Otherwise, perform the work directly.
3. **Execution:** Create branch → Implement → Test → Commit → Push → Merge → Update roadmap.
4. **Continuity:** Automatically proceed to the next eligible roadmap task. **Do not stop after one feature or merge.**
5. **Blockers:** Attempt safe recovery. Pause only for unresolved errors, missing requirements, permissions, required approvals, or unsafe operations. Continue independent tasks when possible.
6. **Completion:** Stop when all authorized tasks are finished, remaining tasks are deferred or blocked, or the user stops execution.
7. **Knowledge:** Update relevant documentation, preserve reusable lessons in Obsidian, and refresh Graphify after significant changes.
