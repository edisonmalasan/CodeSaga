# Public interface verification — 2026-10-20

Scope: M02 public discovery and original static reading previews, with explicit unconfigured identity/execution adapters. This records implementation evidence; the independent design findings and fix score remain in `finish-review.md` and `finish-verdict.md`.

## Local checks

- `pnpm typecheck` and `pnpm test:typecheck`: passed, including the acceptance test source.
- Package tests: contracts 6, authored content 7, web 6, API 17 passed. The ordinary API invocation explicitly skips its PostgreSQL suite; the mandatory `pnpm test:integration` separately passed all 5 real-database tests with zero skips.
- `pnpm build` and `pnpm audit:boundaries`: passed. The final retry-handler correction also passed a fresh web production build and boundary audit (14 traces, 16 client chunks). Local audit had no secret canary; Linux CI supplies one.
- `CI=true pnpm exec playwright test --retries=0`: all 11 passed against separate production processes. Includes all four reading lessons at 320/390/768/1024/1440 pixels, filter/reset/read navigation, local preference persistence and denied storage, keyboard/menu recovery, canonical aliases and metadata, wrong-parent/upcoming/unknown identities, rich-image expansion/failure and clipboard success/failure. Earlier selector failures were corrected to native disclosure/accessible role locators; the passing run had no retries.
- Single manual final design detector: empty findings array in `detector.json`. No second detector was run; normal configured edit hooks remained enabled.

## Fault injection and recovery

With the compiled web server running on its configured origin, stopped the coordinator-owned API process. `/courses` displayed the explicit reading-service error and Retry content control. Restored the configured API to health 200 and clicked that control.

The first run failed: resetting the client boundary alone retained the failed server render for at least 30 seconds. The final handler requests the current page again. The repeated production sequence passed: explicit error while API was unavailable → API restored → Retry content → loaded course heading and real Python course link. No manual URL edit or fabricated fallback content was used. `api-outage-mobile.png`, `api-recovered-mobile.png` and `capture-state.json` record this check. The fault injection is a coordinated local verification, not part of the concurrent CI browser suite.

## Visual evidence and limits

All 14 original captures were inspected and replaced after correcting mobile HTML reading width and resource authoring-metadata leakage. After the final retry correction the same matrix was recaptured, followed by outage/recovery captures, for 16 files listed in `capture-state.json`. The normal matrix records zero page errors, restored dialog trigger focus, and document width 390 at viewport 390 for the HTML lesson. The original loading-skeleton capture was replaced with actual loaded reading content before review.

Original camp media retains embedded generation provenance; the exact prompt stays outside public assets. Silkscreen is locally served with its license. External video playback and subjective audio listening were not tested; no external video is included in this authored release. This evidence does not certify other browsers, screen readers, live identity/execution, durable learner progress, authoring administration, deployment or launch readiness. Remote CI and release/merge evidence are maintained in `docs/ROADMAP.md` at the repository root.

## Catalog guidance extension

After the initial interface review, M02.04 still required prerequisites/recommendations within the catalog cards themselves. Source checkpoint `16adb34` adds compact native disclosures using existing tokens and validated course records. Fresh web production build, acceptance-source typecheck and all 11 production browser tests passed with retries disabled; the reading/filter journey now opens the Python card, verifies its exact published guidance and closes it with Enter. The separate extension matrix is `cards-state.json`: desktop light, mobile light and desktop dark with guidance expanded; mobile document/viewport is 390/390 and no page errors were observed. The earlier 16-capture review remains historical evidence for the base interface and retry correction. The scoped extension verdict is recorded separately in `cards-review.md`.
