# Public accessibility checks

The `accessibility` Playwright project uses pinned `@axe-core/playwright` 4.14.0 with default axe rules in Chromium. It complements the existing three-engine functional journeys. Automated results cover the current original public slice; they do not establish WCAG conformance or replace assistive-technology/user testing. See [Playwright's accessibility guidance](https://playwright.dev/docs/accessibility-testing).

## Scope and execution

```powershell
$env:CI='true'
pnpm exec playwright test --project=accessibility --retries=0
```

Use current production builds, local environment setup and free ports 3000/4000, as described in the [acceptance matrix](README.md). Run `pnpm test:e2e --retries=0` for the complete matrix. The suite is bounded at four minutes, with a five-minute CI step; retries were not increased.

The current catalog yields 28 route/state URLs: home, discovery/collections/search/utilities, empty searches, not-found, every course/chapter, every available reading preview and every published resource. All run in light and dark themes: 56 cases. Open preferences/mobile navigation and image dialogs add four cases. Two further cases check 200% root text sizing with skip-to-main navigation, and reduced-motion/forced-colors emulation with menu focus restoration. There are **62 accessibility cases and 62 axe scans**, plus the earlier 29 functional/HTTP cases: **91 cases total**. Published routes are derived from the validated content authority, so catalog additions expand coverage.

Each scan waits for fonts, the selected rendered foreground, unique document IDs and two animation frames before analysis. An initial dark-home run reported mixed-theme colors. The first Linux run also recorded transient duplicate-ID checks and one mixed-theme inline-code result; five cases passed on retry. That run is retained as diagnostic evidence and was not accepted for merge. The readiness assertions cover the completed rendered document without deleting hidden nodes or excluding rules. Retries are now disabled in configuration and CI. Confirmed collection hierarchy defects were fixed through the shared list's heading level: H2 on standalone collections, H3 beneath existing H2 sections. The same class preserves the former typography. Named, keyboard-focusable code blocks now have an explicit group role; review of axe's inconclusive generic-role warnings exposed that markup defect.

## Reports and inconclusive checks

Each scan writes `test-results/<case>/axe-<state>.json` and attaches it to the test. Reports contain route pathname, state/theme, engine version, pass/inapplicable counts, rule IDs/help links and selectors for violations/inconclusive checks. They contain no DOM HTML, bodies, credentials, cookies or environment values. These cases use only original public pages; do not reuse this reporting policy for private account data without review.

CI uploads these explicitly named JSON files as `public-accessibility-<full-sha>`, retained for 14 days, after an attempted acceptance step even if tests fail. Source inventories remain a separate artifact generated only after successful verification and cleanup. Download with `gh run download RUN_ID -n public-accessibility-FULL_SHA -D .local/accessibility-evidence/RUN_ID`. Do not infer a pass from artifact existence; inspect the final workflow conclusion and reports.

**Inconclusive is not pass.** Violations fail. New inconclusive rules/targets also fail pending explicit review. Four current contrast results remain reported for review, without suppressing axe execution:

| State, both themes | Target and review |
| --- | --- |
| Open mobile navigation | `h1`, `.page-intro > p`: the navigation overlays this underlying introductory content; the open-menu render confirms occlusion. Unobscured page content is scanned separately. |
| Open preferences | `.preference-panel > p`: inspected at 390×844 after rendered-theme readiness. Its bottom is about 404px, inside the viewport. Computed foreground/background are `#52676f`/white in light mode (5.95:1), and `#b4c9cd`/`#19343d` in dark mode (7.61:1), above 4.5:1. Rendered light/dark panels were inspected. Axe still marks this target inconclusive; no engine pass is claimed for it. |

The explicit review target list is local to the two tested states; other inconclusive results cannot silently enter this baseline. Manual contrast calculations use the measured opaque panel colors; they do not certify every compositing, zoom, contrast or device setting.

## Limits

The text-size test changes the root CSS font size to 200%; it is not a complete browser/page zoom assessment. Media emulation is not physical Windows high-contrast verification or real-device touch. Screen-reader listening/navigation, cognitive review, meaningful alt-text evaluation, subjective sound, full contrast/zoom matrices, external video and future authenticated/editor/terminal flows remain separate roadmap gates. The existing global reduced-motion override is exercised for usable navigation, not certified for every future animation.

Local captures stay ignored in `.local/release-evidence`; the repeatable tests, JSON reports and the roadmap's CI evidence own this checkpoint. [Roadmap M16.02](../docs/ROADMAP.md) remains unchecked until its full release scope has evidence.
