# Public acceptance matrix

`playwright.config.ts` declares three cross-process HTTP cases once in project `http`, nine public discovery/reading, four preference and one security case in each of `chromium`, `firefox` and `webkit`, and 62 Chromium accessibility cases: **107 cases** total. [Accessibility scope and report interpretation](ACCESSIBILITY.md) own the axe checks. The workspace pins Playwright; its CLI installs matching engine binaries as described in the [official browser guide](https://playwright.dev/docs/browsers). These are automated engine tests, not certification of branded Chrome/Edge/Safari, physical mobile devices or every OS/browser combination.

## Run

From the repository root with environment setup, the local PostgreSQL fixture and current production builds available, and ports 3000/4000 free:

```powershell
pnpm exec playwright install chromium firefox webkit
$env:CI='true'
pnpm test:e2e --retries=0
```

`CI=true` chooses production processes and two workers; omitting it chooses development processes. Servers are owned by Playwright with bounded shutdown and cannot silently reuse an existing app. The global timeout is four minutes; CI's browser step is bounded at five minutes. Retries are disabled in the configuration and explicitly in the CI command, so retry-only passes cannot satisfy acceptance.

Use `pnpm exec playwright test --project=webkit --retries=0` for a focused engine run, or `--project=http` for only the process contracts. A scoped run does not establish the full matrix. Browser fixture installation needs network access; Linux CI also installs the required OS libraries.

## Included evidence

| Cases per engine | Covered behavior |
| --- | --- |
| Catalog → course → lesson | Native prerequisite disclosure, composed filters, empty/reset, validated original identities, static reading without Run |
| Mobile navigation/preferences | 390×844 CSS viewport, pointer-open then Escape/focus restoration, theme/motion/sound preference restoration across reload |
| Denied browser storage | Explicit session-only preference state; usable content/filtering; choices survive client navigation and reset on full reload |
| Saved appearance before hydration (two cases) | Hold back Next.js JS chunks; light/dark saved choice overrides opposite device preference before the body exists; reduced motion applies, no audio starts; release hydration and verify controlled values with no theme reversal or console/page errors |
| Preference synchronization | Real same-origin tabs receive theme/motion/sound changes and key removal/clear; sessionStorage event and unrelated key do not change choices |
| Malformed preferences | Five stored values exercise invalid JSON/null/array/unknown enums/valid data; attributes and controls agree with the parser, and bootstrap/hydration do not rewrite storage |
| Enforced script policy | Parse a real response with injected nonce-free/forged-nonce scripts; observe both blocked while saved appearance, hydration and controlled filtering work |
| Alias/invalid/parent scope | Canonical identity, wrong-parent and malformed URLs, upcoming metadata without invented reading bodies |
| Responsive reading/skip link | Home and all four reading previews at 320/390/768/1024/1440 CSS widths; no document overflow; first Tab reaches skip link and Enter focuses main |
| Metadata/indexes | Canonical identity, public sitemap and robots; no private route families |
| Media | Original image expansion, Escape/trigger focus restoration and forced broken-image fallback using its accessible figure identity |
| Sharing | Canonical copied URL; explicit clipboard failure and selectable fallback |
| Reading collections/utilities | Resources/tutorials/blog/about/help/pricing/search and invalid prototype-like route names |

The HTTP project checks separate web/API health contracts, real PostgreSQL readiness, the unknown-route error/request-ID contract and caller-independent document nonces/security headers/static-resource policies. It also verifies unavailable document content/noindex, allowing the documented Next.js 200/404 distinction before/after streaming. [Public HTTP policy](../docs/SECURITY.md) owns that boundary and its limits. HTTP cases do not require launching a browser and are not duplicated per engine. Preference cases use isolated browser contexts and no account. Local screenshots live in ignored `test-results`; timing assertions establish attributes before the body and hydration, not a measured paint-performance budget or physical-device guarantee.

## Recorded checkpoint and limitations

On 2026-10-21, the production matrix passed **29/29 with retries disabled on Windows/Node 26.10.0**. The first broader run exposed a mobile-menu focus defect in WebKit, a skip-link reachability difference and an ambiguous image-class selector. The menu trigger now takes focus on activation so Escape reaches its existing header handler; the skip link has explicit `tabIndex={0}` and must pass the same Tab/Enter assertions in every engine. A minimal Windows WebKit page independently reproduced ordinary-link omission with both Tab and Alt+Tab, and verified explicit zero-tabindex reachability. The image test identifies its visible accessible figure by caption instead of broadly matching transient figures during reload. No browser-specific assertion bypass or retry increase was added.

Rendered WebKit captures at 390×844 (open/closed menu and restored focus) and 1440×900 were inspected locally; the palette, native controls and focus ring conform to the existing [design system](../apps/web/DESIGN.md). Those local captures are ignored; automated acceptance and the roadmap's linked CI run own repeatable verification. Historical M02 captures remain its earlier scoped evidence.

Application source `defe8a4` subsequently passed the [complete Linux/Node 24 workflow](https://github.com/edisonmalasan/CodeSaga/actions/runs/39493073451), including all 29 cases in 31 seconds with no flaky/retried outcome, service cleanup and source-inventory upload. The workflow permits a retry, but none was needed for this run.

CSS viewport resizing does not emulate a complete phone or supply physical touch, real-device Safari/Chrome, screen-reader listening, subjective sound checks, full zoom/high-contrast coverage or external-video playback. The public cases do not certify an account, owner/paid/staff workflow, live execution, durable progress, Build, billing or deployment. M16.01/M16.02 retain their remaining gates in the [roadmap](../docs/ROADMAP.md).
