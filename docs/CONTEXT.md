# Project Context

## At a Glance

- **Project:** CodeSaga.
- **What it does:** Planned original coding-learning platform inspired by the retained Codédex investigation: courses, real browser-based coding, checked practice, durable progress, Builds, projects and community, with later commerce, AI, habits and role-specific features.
- **Primary users / use cases:** Self-directed beginners learning to code in a browser, confirmed by the user; projects/community support that learning journey. Later role-specific workflows remain planned.
- **Current state:** M01 foundation is complete. Original public discovery and reading previews are implemented; the roadmap owns exact completion/review/CI evidence. Account integration, real execution and deployment remain unavailable; this is not the interactive alpha release.
- **Current focus:** Autonomous roadmap execution is active by explicit user request on 2026-10-20. M01/M02 public delivery is verified; the next interactive work follows identity/execution setup gates. Adapters are prepared, while providers and hosting remain undecided.

## Where to Look

| Need | Canonical source |
|---|---|
| Confirmed audience, product brief, platform and selected stack | Root [PRODUCT.md](../PRODUCT.md); initialized through Impeccable after the user interview |
| Feature scope, milestones, dependencies, acceptance and progress | [ROADMAP.md](ROADMAP.md); M01–M16 and EXT01–EXT07 |
| Frontend routes/modules/state/editor/visual boundaries | [ARCHITECTURE.md](ARCHITECTURE.md), section 4 |
| Backend modules, transactions, workers and data ownership | [ARCHITECTURE.md](ARCHITECTURE.md), sections 5–6 |
| API/events, Run/Submit/save/publish/billing/AI/date flows | [ARCHITECTURE.md](ARCHITECTURE.md), sections 7–8 |
| Execution/preview isolation, permissions, operations and decisions | [ARCHITECTURE.md](ARCHITECTURE.md), sections 9–12 |
| Current behavior and installed dependencies | `apps/web`, `apps/api`, `packages/contracts`, `packages/content`, package manifests and `pnpm-lock.yaml`; future paths in architecture remain proposals |
| Published original curriculum and stable identities | `packages/content/src/catalog.json` and its loader/relationship tests; public schemas in `packages/contracts/src/content.ts` |
| Original interface design and assets | [Frontend design system](../apps/web/DESIGN.md), scoped sidecar/brief/captures in `apps/web/.impeccable/`, and [asset provenance](../apps/web/ASSETS.md) |
| Identity/execution configuration needs | [Provider setup](../apps/api/PROVIDER_SETUP.md); unavailable adapter behavior and checks in [API verification](../apps/api/VERIFICATION.md) |
| Setup, run, verify and local service commands | Root [README.md](../README.md); [AGENTS.md](../AGENTS.md) retains working rules and command summary |
| Local PostgreSQL restore rehearsal and limitations | [Recovery runbook](../infra/RECOVERY.md); real fixture verification through `pnpm db:rehearse-restore` |
| API request tracing, event fields and logging limits | [Request telemetry](../apps/api/TELEMETRY.md); server-generated `X-Trace-ID`, approved route templates and redaction checks |
| Public browser script/embedding restrictions and API response headers | [Public HTTP security policy](SECURITY.md); nonce lifecycle, document/static/JSON boundaries and caching/deployment limits |
| Source inventory, CI evidence and release/rollback limits | [Release handoff](RELEASE.md); `pnpm release:record` and the workflow's source inventory artifact |
| Public browser coverage, focused engine runs and test limits | [Acceptance matrix](../tests/README.md); Chromium/Firefox/WebKit public journeys plus separate HTTP checks |
| Automated accessibility, text resizing/media emulation and inconclusive findings | [Accessibility checks](../tests/ACCESSIBILITY.md); public light/dark scans and scoped CI JSON reports |
| Appearance/motion before hydration, browser preference synchronization and storage fallback | [Architecture](ARCHITECTURE.md), section 2.0; [acceptance matrix](../tests/README.md) owns timing, cross-tab and failure checks |
| Research entry point and detailed context map | [re/README.md](../re/README.md) |
| Original records, references and integrity | [Evidence register](../re/docs/01-evidence-register.md), [archive audit](../re/docs/evidence/archive-audit.json), [verification/replay](../re/docs/11-verification-and-replay.md) |
| Reference product/content/visual model | [02 Routes/content](../re/docs/02-routes-content.md), [03 Product systems](../re/docs/03-product-systems.md), [05 Visual system](../re/docs/05-visual-interaction-system.md) |
| Reference editor/protocol/client/API mechanisms | [04 Learning](../re/docs/04-learning-editor-runtime.md), [06 Client](../re/docs/06-client-architecture.md), [07 Contracts](../re/docs/07-api-data-contracts.md), [10 Protocol](../re/docs/10-runtime-protocol-and-storage.md), [13 Traces](../re/docs/13-deeper-client-traces.md) |
| Additional runtimes, public edges and authenticated checks | [12 Runtimes](../re/docs/12-additional-editor-runtimes.md), [14 Public edges](../re/docs/14-public-interaction-edge-cases.md), [15 Account UI](../re/docs/15-signed-in-account-investigation.md), [16 Focused verification](../re/docs/16-build-progress-and-runtime-verification.md) |
| Remaining target unknowns versus CodeSaga choices | [09 Research unknowns](../re/docs/09-coverage-and-open-questions.md); roadmap U01–U22 mapping; architecture D01–D16 |
| Graphify / Obsidian | Installed Graphify CLI; ignored local `graphify-out/graph.json` and `GRAPH_REPORT.md`, generated offline from code. SQL parser is absent and some test/data files yield no symbols; verify against source. No central vault configured or edited |

## Project-Specific Constraints

- The user requested complete evidence-based planning, readable frontend/backend architecture, and population of AGENTS **without changing its existing rules**.
- The user confirmed the core frontend/backend stack in [PRODUCT.md](../PRODUCT.md). Foundation dependencies are pinned; supporting provider decisions, limits, pricing, hosting and launch date remain unresolved. Architecture section 2.0 records the local baseline and first alpha scope.
- Record only verified implementation outcomes in the roadmap. Research verification does not count as CodeSaga implementation.
- Reference observations, static mechanisms, unknowns and proposed CodeSaga policies remain distinct. Later investigation document 16 qualifies earlier incomplete React/C#/owner findings.
- Original/appropriately licensed CodeSaga content, branding, characters and media are required for the proposed product; captured target content/assets/UGC are reference evidence.
- The existing .gitignore ignores re. A normal clone will not include this local evidence unless a separately approved sanitized handoff is arranged. Preserve the ignore rule.
- Private target backend source/rules and complete paid/role workflows were not recovered. The final authenticated checks prove same-browser behavior; cross-session server durability/enforcement remains a separate CodeSaga verification target.

## Research Handoff State

The reference investigation is locally retained: 17 documents, 58 unique REA records, 14 initial signed-in Computer Use states and 44 focused states, plus 23 visual transcriptions. The recorded research audit passed with zero errors. Use the audit artifact for exact counts/date rather than assuming later edits have been audited.

The user-authorized temporary reference Build was deleted and its dashboard restored to 0/5 after reload. The designated account intentionally retained Initials completion and +15 XP; React source was restored and corrected C# probe source was left in its lesson editor. That bounded test is finished; these facts do not authorize further account changes. REA MCP ceased being exposed late in research; the final pass is attributed to Computer Use, not new REA records.

## Next Useful Work

Use the roadmap's current completion and dependency gates. Identity/session and execution ports exist with explicit unconfigured responses. The user requested adapter preparation while providers remain unselected; real account, runtime, grading/progress and owned-workspace journeys remain gated by [provider setup](../apps/api/PROVIDER_SETUP.md). Source-controlled publication validation and foundational release checks support M15/M16; privileged authoring and launch readiness remain unfinished. No central vault is configured, so decisions remain in repository docs. Do not introduce a second architectural source of truth or duplicate the research archive into these docs.

## Context Loading Rules

1. Start with the user's task and this routing file.
2. Open only the relevant section of `docs/ROADMAP.md`, not the entire roadmap unless needed.
3. Inspect directly affected source files and tests.
4. Consult architecture docs, related Obsidian notes, or Graphify **only when relevant and available**.
5. If sources disagree, report the conflict; do not silently choose whichever is convenient.
6. Do not treat generated graphs or old memory notes as more authoritative than current source code and approved requirements.
