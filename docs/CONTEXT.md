# Project Context

## At a Glance

- **Project:** CodeSaga.
- **What it does:** Planned original coding-learning platform inspired by the retained Codédex investigation: courses, real browser-based coding, checked practice, durable progress, Builds, projects and community, with later commerce, AI, habits and role-specific features.
- **Primary users / use cases:** Self-directed beginners learning to code in a browser, confirmed by the user; projects/community support that learning journey. Later role-specific workflows remain planned.
- **Current state:** M01 foundation is complete: clean-source installation/verification and full Linux CI passed, including real PostgreSQL and signed object checks. No learner UI, account integration or deployment is shipped yet.
- **Current focus:** Autonomous roadmap execution is active by explicit user request on 2026-10-20. Continue M02 original discovery/content and prepare identity/execution adapters; providers and hosting remain undecided.

## Where to Look

| Need | Canonical source |
|---|---|
| Confirmed audience, product brief, platform and selected stack | Root [PRODUCT.md](../PRODUCT.md); initialized through Impeccable after the user interview |
| Feature scope, milestones, dependencies, acceptance and progress | [ROADMAP.md](ROADMAP.md); M01–M16 and EXT01–EXT07 |
| Frontend routes/modules/state/editor/visual boundaries | [ARCHITECTURE.md](ARCHITECTURE.md), section 4 |
| Backend modules, transactions, workers and data ownership | [ARCHITECTURE.md](ARCHITECTURE.md), sections 5–6 |
| API/events, Run/Submit/save/publish/billing/AI/date flows | [ARCHITECTURE.md](ARCHITECTURE.md), sections 7–8 |
| Execution/preview isolation, permissions, operations and decisions | [ARCHITECTURE.md](ARCHITECTURE.md), sections 9–12 |
| Current behavior and installed dependencies | `apps/web`, `apps/api`, `packages/contracts`, package manifests and `pnpm-lock.yaml`; future paths in architecture remain proposals |
| Setup, run, verify and local service commands | Root [README.md](../README.md); [AGENTS.md](../AGENTS.md) retains working rules and command summary |
| Research entry point and detailed context map | [re/README.md](../re/README.md) |
| Original records, references and integrity | [Evidence register](../re/docs/01-evidence-register.md), [archive audit](../re/docs/evidence/archive-audit.json), [verification/replay](../re/docs/11-verification-and-replay.md) |
| Reference product/content/visual model | [02 Routes/content](../re/docs/02-routes-content.md), [03 Product systems](../re/docs/03-product-systems.md), [05 Visual system](../re/docs/05-visual-interaction-system.md) |
| Reference editor/protocol/client/API mechanisms | [04 Learning](../re/docs/04-learning-editor-runtime.md), [06 Client](../re/docs/06-client-architecture.md), [07 Contracts](../re/docs/07-api-data-contracts.md), [10 Protocol](../re/docs/10-runtime-protocol-and-storage.md), [13 Traces](../re/docs/13-deeper-client-traces.md) |
| Additional runtimes, public edges and authenticated checks | [12 Runtimes](../re/docs/12-additional-editor-runtimes.md), [14 Public edges](../re/docs/14-public-interaction-edge-cases.md), [15 Account UI](../re/docs/15-signed-in-account-investigation.md), [16 Focused verification](../re/docs/16-build-progress-and-runtime-verification.md) |
| Remaining target unknowns versus CodeSaga choices | [09 Research unknowns](../re/docs/09-coverage-and-open-questions.md); roadmap U01–U22 mapping; architecture D01–D16 |
| Graphify / Obsidian | No generated graph, installation or central vault configuration verified; use repository docs |

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

Continue M02 original content/discovery and provider adapters after the verified foundation merge. The user confirmed original pixel-inspired adventure visuals while providers remain unselected. Continue independent eligible work; record provider-dependent blockers precisely. Do not introduce a second architectural source of truth or duplicate the research archive into these docs.

## Context Loading Rules

1. Start with the user's task and this routing file.
2. Open only the relevant section of `docs/ROADMAP.md`, not the entire roadmap unless needed.
3. Inspect directly affected source files and tests.
4. Consult architecture docs, related Obsidian notes, or Graphify **only when relevant and available**.
5. If sources disagree, report the conflict; do not silently choose whichever is convenient.
6. Do not treat generated graphs or old memory notes as more authoritative than current source code and approved requirements.
